/**
 * Unit Tests for Shop Slug Resolution Utilities
 * Testing shop slug to ID resolution and ownership validation
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import {
  batchResolveShopSlugs,
  getShopIdAndValidateOwnership,
  resolveShopSlug,
  resolveShopSlugToData,
  validateShopOwnership,
} from "../shop-slug-resolver";

// Mock Collections
jest.mock("@/app/api/lib/firebase/collections", () => ({
  Collections: {
    shops: jest.fn(),
  },
}));

describe("resolveShopSlug", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("Successful Resolution", () => {
    it("should resolve shop slug to ID", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop123" }],
      });

      const result = await resolveShopSlug("awesome-shop");

      expect(result).toBe("shop123");
      expect(mockQuery.where).toHaveBeenCalledWith(
        "slug",
        "==",
        "awesome-shop"
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
    });

    it("should handle slugs with special characters", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop456" }],
      });

      const result = await resolveShopSlug("my-cool-shop-2024");

      expect(result).toBe("shop456");
    });

    it("should handle slugs with numbers", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop789" }],
      });

      const result = await resolveShopSlug("shop123");

      expect(result).toBe("shop789");
    });
  });

  describe("Not Found Cases", () => {
    it("should return null when shop not found", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await resolveShopSlug("nonexistent-shop");

      expect(result).toBeNull();
    });

    it("should return null for empty slug", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await resolveShopSlug("");

      expect(result).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle query errors gracefully", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await resolveShopSlug("test-shop");

      expect(result).toBeNull();
    });

    it("should handle permission errors", async () => {
      mockQuery.get.mockRejectedValue(
        new Error("Missing or insufficient permissions")
      );

      const result = await resolveShopSlug("test-shop");

      expect(result).toBeNull();
    });

    it("should handle network errors", async () => {
      mockQuery.get.mockRejectedValue(new Error("Network error"));

      const result = await resolveShopSlug("test-shop");

      expect(result).toBeNull();
    });
  });
});

describe("resolveShopSlugToData", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("Successful Resolution", () => {
    it("should resolve shop slug to full data", async () => {
      const mockShopData = {
        name: "Awesome Shop",
        slug: "awesome-shop",
        owner_id: "user123",
        description: "Great shop",
      };

      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => mockShopData,
          },
        ],
      });

      const result = await resolveShopSlugToData("awesome-shop");

      expect(result).toEqual({
        id: "shop123",
        ...mockShopData,
      });
    });

    it("should include ID in returned data", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop456",
            data: () => ({ name: "Test Shop" }),
          },
        ],
      });

      const result = await resolveShopSlugToData("test-shop");

      expect(result?.id).toBe("shop456");
    });

    it("should handle shops with minimal data", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop789",
            data: () => ({ slug: "minimal-shop" }),
          },
        ],
      });

      const result = await resolveShopSlugToData("minimal-shop");

      expect(result).toEqual({
        id: "shop789",
        slug: "minimal-shop",
      });
    });

    it("should handle shops with nested data", async () => {
      const complexData = {
        name: "Complex Shop",
        settings: { theme: "dark", language: "en" },
        stats: { products: 100, sales: 50 },
      };

      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop999",
            data: () => complexData,
          },
        ],
      });

      const result = await resolveShopSlugToData("complex-shop");

      expect(result).toEqual({
        id: "shop999",
        ...complexData,
      });
    });
  });

  describe("Not Found Cases", () => {
    it("should return null when shop not found", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await resolveShopSlugToData("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle query errors gracefully", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await resolveShopSlugToData("test-shop");

      expect(result).toBeNull();
    });

    it("should handle data extraction errors", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => {
              throw new Error("Data error");
            },
          },
        ],
      });

      // Error is caught and returns null
      const result = await resolveShopSlugToData("test-shop");
      expect(result).toBeNull();
    });
  });
});

describe("batchResolveShopSlugs", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("Basic Batch Resolution", () => {
    it("should resolve multiple shop slugs", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "shop1", data: () => ({ slug: "shop-one" }) },
          { id: "shop2", data: () => ({ slug: "shop-two" }) },
        ],
      });

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(2);
      expect(result.get("shop-one")).toBe("shop1");
      expect(result.get("shop-two")).toBe("shop2");
    });

    it("should handle empty array", async () => {
      const result = await batchResolveShopSlugs([]);

      expect(result.size).toBe(0);
      expect(mockQuery.get).not.toHaveBeenCalled();
    });

    it("should handle single slug", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [{ id: "shop1", data: () => ({ slug: "single-shop" }) }],
      });

      const result = await batchResolveShopSlugs(["single-shop"]);

      expect(result.size).toBe(1);
      expect(result.get("single-shop")).toBe("shop1");
    });
  });

  describe("Chunking for Firestore Limit", () => {
    it("should handle exactly 10 slugs in single query", async () => {
      const slugs = Array.from({ length: 10 }, (_, i) => `shop-${i}`);
      const docs = slugs.map((slug, i) => ({
        id: `shop${i}`,
        data: () => ({ slug }),
      }));

      mockQuery.get.mockResolvedValue({ docs });

      const result = await batchResolveShopSlugs(slugs);

      expect(result.size).toBe(10);
      expect(mockQuery.where).toHaveBeenCalledTimes(1);
    });

    it("should chunk queries for more than 10 slugs", async () => {
      const slugs = Array.from({ length: 15 }, (_, i) => `shop-${i}`);

      // First chunk (10 items)
      const firstDocs = slugs.slice(0, 10).map((slug, i) => ({
        id: `shop${i}`,
        data: () => ({ slug }),
      }));

      // Second chunk (5 items)
      const secondDocs = slugs.slice(10).map((slug, i) => ({
        id: `shop${i + 10}`,
        data: () => ({ slug }),
      }));

      mockQuery.get
        .mockResolvedValueOnce({ docs: firstDocs })
        .mockResolvedValueOnce({ docs: secondDocs });

      const result = await batchResolveShopSlugs(slugs);

      expect(result.size).toBe(15);
      expect(mockQuery.where).toHaveBeenCalledTimes(2);
    });

    it("should handle 25 slugs across 3 chunks", async () => {
      const slugs = Array.from({ length: 25 }, (_, i) => `shop-${i}`);

      mockQuery.get
        .mockResolvedValueOnce({
          docs: Array.from({ length: 10 }, (_, i) => ({
            id: `shop${i}`,
            data: () => ({ slug: `shop-${i}` }),
          })),
        })
        .mockResolvedValueOnce({
          docs: Array.from({ length: 10 }, (_, i) => ({
            id: `shop${i + 10}`,
            data: () => ({ slug: `shop-${i + 10}` }),
          })),
        })
        .mockResolvedValueOnce({
          docs: Array.from({ length: 5 }, (_, i) => ({
            id: `shop${i + 20}`,
            data: () => ({ slug: `shop-${i + 20}` }),
          })),
        });

      const result = await batchResolveShopSlugs(slugs);

      expect(result.size).toBe(25);
      expect(mockQuery.where).toHaveBeenCalledTimes(3);
    });
  });

  describe("Partial Results", () => {
    it("should handle some slugs not found", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "shop1", data: () => ({ slug: "shop-one" }) },
          // shop-two not found
        ],
      });

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(1);
      expect(result.get("shop-one")).toBe("shop1");
      expect(result.has("shop-two")).toBe(false);
    });

    it("should handle all slugs not found", async () => {
      mockQuery.get.mockResolvedValue({ docs: [] });

      const result = await batchResolveShopSlugs([
        "nonexistent1",
        "nonexistent2",
      ]);

      expect(result.size).toBe(0);
    });
  });

  describe("Edge Cases and Data Issues", () => {
    it("should skip shops with missing slug in data", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "shop1", data: () => ({ slug: "shop-one" }) },
          { id: "shop2", data: () => ({ name: "No Slug Shop" }) },
        ],
      });

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(1);
      expect(result.get("shop-one")).toBe("shop1");
    });

    it("should skip shops with null slug", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "shop1", data: () => ({ slug: "shop-one" }) },
          { id: "shop2", data: () => ({ slug: null }) },
        ],
      });

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(1);
    });

    it("should skip shops with undefined slug", async () => {
      mockQuery.get.mockResolvedValue({
        docs: [
          { id: "shop1", data: () => ({ slug: "shop-one" }) },
          { id: "shop2", data: () => ({ slug: undefined }) },
        ],
      });

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(1);
    });
  });

  describe("Error Handling", () => {
    it("should return empty map on query error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await batchResolveShopSlugs(["shop-one", "shop-two"]);

      expect(result.size).toBe(0);
    });

    it("should handle error in one chunk and return partial results", async () => {
      const slugs = Array.from({ length: 15 }, (_, i) => `shop-${i}`);

      mockQuery.get
        .mockResolvedValueOnce({
          docs: Array.from({ length: 10 }, (_, i) => ({
            id: `shop${i}`,
            data: () => ({ slug: `shop-${i}` }),
          })),
        })
        .mockRejectedValueOnce(new Error("Chunk error"));

      const result = await batchResolveShopSlugs(slugs);

      // BUG: Returns map with first chunk data before error
      // Error handling should clear map or continue, but currently returns partial
      expect(result.size).toBe(10);
    });
  });
});

describe("validateShopOwnership", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("Ownership Validation", () => {
    it("should return true when user owns shop", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [{ id: "shop123" }],
      });

      const result = await validateShopOwnership("my-shop", "user123");

      expect(result).toBe(true);
      expect(mockQuery.where).toHaveBeenCalledWith("slug", "==", "my-shop");
      expect(mockQuery.where).toHaveBeenCalledWith("owner_id", "==", "user123");
    });

    it("should return false when user does not own shop", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await validateShopOwnership("my-shop", "user456");

      expect(result).toBe(false);
    });

    it("should return false when shop not found", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await validateShopOwnership("nonexistent", "user123");

      expect(result).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty user ID", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await validateShopOwnership("my-shop", "");

      expect(result).toBe(false);
    });

    it("should handle empty shop slug", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await validateShopOwnership("", "user123");

      expect(result).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should return false on query error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await validateShopOwnership("my-shop", "user123");

      expect(result).toBe(false);
    });

    it("should return false on permission error", async () => {
      mockQuery.get.mockRejectedValue(
        new Error("Missing or insufficient permissions")
      );

      const result = await validateShopOwnership("my-shop", "user123");

      expect(result).toBe(false);
    });
  });
});

describe("getShopIdAndValidateOwnership", () => {
  let mockQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };
    (Collections.shops as jest.Mock).mockReturnValue(mockQuery);
  });

  describe("Successful Cases", () => {
    it("should return shopId and isOwner true when user owns shop", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: "user123", name: "My Shop" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership("my-shop", "user123");

      expect(result).toEqual({
        shopId: "shop123",
        isOwner: true,
      });
    });

    it("should return shopId and isOwner false when user does not own shop", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: "user456", name: "Other Shop" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership("my-shop", "user123");

      expect(result).toEqual({
        shopId: "shop123",
        isOwner: false,
      });
    });

    it("should return null when shop not found", async () => {
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getShopIdAndValidateOwnership(
        "nonexistent",
        "user123"
      );

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle shop with no owner_id", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ name: "Orphan Shop" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership(
        "orphan-shop",
        "user123"
      );

      expect(result).toEqual({
        shopId: "shop123",
        isOwner: false,
      });
    });

    it("should handle shop with null owner_id", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: null, name: "Shop" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership("my-shop", "user123");

      expect(result).toEqual({
        shopId: "shop123",
        isOwner: false,
      });
    });

    it("should handle empty user ID", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: "user456" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership("my-shop", "");

      expect(result).toEqual({
        shopId: "shop123",
        isOwner: false,
      });
    });
  });

  describe("Error Handling", () => {
    it("should return null on query error", async () => {
      mockQuery.get.mockRejectedValue(new Error("Database error"));

      const result = await getShopIdAndValidateOwnership("my-shop", "user123");

      expect(result).toBeNull();
    });

    it("should return null on permission error", async () => {
      mockQuery.get.mockRejectedValue(
        new Error("Missing or insufficient permissions")
      );

      const result = await getShopIdAndValidateOwnership("my-shop", "user123");

      expect(result).toBeNull();
    });

    it("should handle data extraction error", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => {
              throw new Error("Data error");
            },
          },
        ],
      });

      // Error is caught and returns null
      const result = await getShopIdAndValidateOwnership("my-shop", "user123");
      expect(result).toBeNull();
    });
  });

  describe("Integration with API Patterns", () => {
    it("should support admin override pattern", async () => {
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: "user456" }),
          },
        ],
      });

      const result = await getShopIdAndValidateOwnership("my-shop", "admin123");

      // Admin can check ownership and override if needed
      expect(result?.shopId).toBe("shop123");
      expect(result?.isOwner).toBe(false);
    });

    it("should support 404 vs 403 error distinction", async () => {
      // Shop not found - should return 404
      mockQuery.get.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const notFound = await getShopIdAndValidateOwnership(
        "nonexistent",
        "user123"
      );
      expect(notFound).toBeNull();

      // Shop found but not owner - should return 403
      mockQuery.get.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: "shop123",
            data: () => ({ owner_id: "user456" }),
          },
        ],
      });

      const unauthorized = await getShopIdAndValidateOwnership(
        "other-shop",
        "user123"
      );
      expect(unauthorized?.isOwner).toBe(false);
    });
  });
});
