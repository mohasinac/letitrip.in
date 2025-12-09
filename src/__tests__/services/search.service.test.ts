import { apiService } from "@/services/api.service";
import { searchService } from "@/services/search.service";
import type { SearchResultFE } from "@/types/frontend/search.types";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe("SearchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
  });

  describe("search", () => {
    it("should perform global search with query only", async () => {
      const mockResult: SearchResultFE = {
        products: [
          {
            id: "prod-1",
            name: "iPhone 15 Pro",
            price: 129900,
            image: "/images/iphone.jpg",
          },
        ],
        shops: [
          {
            id: "shop-1",
            name: "Apple Store",
            logo: "/logos/apple.jpg",
          },
        ],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({ q: "iphone" });

      expect(apiService.get).toHaveBeenCalledWith("/search?q=iphone");
      expect(result.products).toHaveLength(1);
      expect(result.shops).toHaveLength(1);
    });

    it("should search with type filter", async () => {
      const mockResult: SearchResultFE = {
        products: [
          {
            id: "prod-1",
            name: "MacBook Pro",
            price: 199900,
            image: "/images/macbook.jpg",
          },
        ],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({
        q: "macbook",
        type: "products",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/search?q=macbook&type=products"
      );
      expect(result.products).toHaveLength(1);
      expect(result.shops).toHaveLength(0);
    });

    it("should search with limit parameter", async () => {
      const mockResult: SearchResultFE = {
        products: Array(10)
          .fill(null)
          .map((_, i) => ({
            id: `prod-${i}`,
            name: `Product ${i}`,
            price: 1000 + i,
            image: `/images/prod-${i}.jpg`,
          })),
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({
        q: "laptop",
        limit: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith("/search?q=laptop&limit=10");
      expect(result.products).toHaveLength(10);
    });

    it("should search with all filters", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [
          {
            id: "shop-1",
            name: "Electronics Hub",
            logo: "/logos/hub.jpg",
          },
        ],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({
        q: "electronics",
        type: "shops",
        limit: 5,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/search?q=electronics&type=shops&limit=5"
      );
      expect(result.shops).toHaveLength(1);
    });

    it("should handle empty search query", async () => {
      const result = await searchService.search({ q: "" });

      // Service returns early without API call for empty queries
      expect(apiService.get).not.toHaveBeenCalled();
      expect(result.products).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it("should handle search with special characters", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const specialQuery = 'laptop @#$% 15"';
      await searchService.search({ q: specialQuery });

      // URLSearchParams encodes special characters
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/search?q=")
      );
    });

    it("should return all result types", async () => {
      const mockResult: SearchResultFE = {
        products: [
          {
            id: "prod-1",
            name: "Product 1",
            price: 1000,
            image: "/images/prod1.jpg",
          },
        ],
        shops: [
          {
            id: "shop-1",
            name: "Shop 1",
            logo: "/logos/shop1.jpg",
          },
        ],
        categories: [
          {
            id: "cat-1",
            name: "Electronics",
            slug: "electronics",
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({ q: "electronics" });

      expect(result.products).toHaveLength(1);
      expect(result.shops).toHaveLength(1);
      expect(result.categories).toHaveLength(1);
    });
  });

  describe("quickSearch", () => {
    it("should perform quick search with default limit", async () => {
      const mockResult: SearchResultFE = {
        products: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: `prod-${i}`,
            name: `Phone ${i}`,
            price: 10000 + i,
            image: `/images/phone-${i}.jpg`,
          })),
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.quickSearch("phone");

      expect(apiService.get).toHaveBeenCalledWith("/search?q=phone&limit=5");
      expect(result.products).toHaveLength(5);
    });

    it("should be suitable for autocomplete", async () => {
      const mockResult: SearchResultFE = {
        products: [
          { id: "prod-1", name: "iPhone 15", price: 79900, image: "/img1.jpg" },
          { id: "prod-2", name: "iPhone 14", price: 69900, image: "/img2.jpg" },
          { id: "prod-3", name: "iPhone 13", price: 59900, image: "/img3.jpg" },
        ],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.quickSearch("iph");

      expect(result.products).toHaveLength(3);
      expect(
        result.products.every((p) => p.name.toLowerCase().includes("iphone"))
      ).toBe(true);
    });

    it("should handle quick search with no results", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.quickSearch("xyzabc123");

      expect(result.products).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it("should handle quick search errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Search failed")
      );

      const result = await searchService.quickSearch("test");

      // Service returns empty results instead of throwing
      expect(result.products).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await searchService.search({ q: "test" });

      // Service returns empty results instead of throwing
      expect(result.products).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it("should handle very long search queries", async () => {
      const longQuery = "a".repeat(1000);
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({ q: longQuery });

      expect(apiService.get).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should handle Unicode characters in search", async () => {
      const mockResult: SearchResultFE = {
        products: [
          {
            id: "prod-1",
            name: "उत्पाद 1", // Hindi text
            price: 1000,
            image: "/img.jpg",
          },
        ],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({ q: "उत्पाद" });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("उत्पाद 1");
    });

    it("should handle malformed API response", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await searchService.search({ q: "test" });

      // Service handles null/undefined results gracefully
      expect(result.products).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.categories).toHaveLength(0);
    });

    it("should handle missing result properties", async () => {
      const mockResult = {
        products: null,
        shops: undefined,
        // categories missing
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await searchService.search({ q: "test" });

      // Service should handle gracefully or throw
      expect(result).toBeDefined();
    });

    it("should handle concurrent search requests", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      const promises = [
        searchService.search({ q: "laptop" }),
        searchService.search({ q: "phone" }),
        searchService.quickSearch("tablet"),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(apiService.get).toHaveBeenCalledTimes(3);
    });

    it("should properly encode URL parameters", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test&type=hack" });

      // Should not allow URL injection
      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("q=test");
      expect(callArg).not.toContain("&type=hack");
    });

    it("should handle zero as limit", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test", limit: 0 });

      // Service only includes limit if > 0
      expect(apiService.get).toHaveBeenCalledWith("/search?q=test");
    });

    it("should handle negative limit values", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test", limit: -1 });

      // Service only includes limit if > 0
      expect(apiService.get).toHaveBeenCalledWith("/search?q=test");
    });
  });

  describe("Search Type Filtering", () => {
    it("should filter by products type", async () => {
      const mockResult: SearchResultFE = {
        products: [
          { id: "prod-1", name: "Product 1", price: 1000, image: "/img.jpg" },
        ],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test", type: "products" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/search?q=test&type=products"
      );
    });

    it("should filter by shops type", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [{ id: "shop-1", name: "Shop 1", logo: "/logo.jpg" }],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test", type: "shops" });

      expect(apiService.get).toHaveBeenCalledWith("/search?q=test&type=shops");
    });

    it("should filter by categories type", async () => {
      const mockResult: SearchResultFE = {
        products: [],
        shops: [],
        categories: [{ id: "cat-1", name: "Category 1", slug: "cat-1" }],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResult);

      await searchService.search({ q: "test", type: "categories" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/search?q=test&type=categories"
      );
    });
  });
});
