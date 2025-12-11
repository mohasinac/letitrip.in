/**
 * Search Service Validation Tests
 *
 * Comprehensive tests for search query validation
 * added in Batch 23 code quality improvements.
 */

import { apiService } from "../api.service";
import { searchService } from "../search.service";

jest.mock("../api.service");

describe("SearchService - Validation Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("search query validation", () => {
    it("should return empty results for empty query", async () => {
      const result = await searchService.search({ q: "" });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should return empty results for whitespace-only query", async () => {
      const result = await searchService.search({ q: "   " });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should throw error for query shorter than 2 characters", async () => {
      await expect(searchService.search({ q: "a" })).rejects.toThrow(
        "[Search] Query too short"
      );

      await expect(searchService.search({ q: "1" })).rejects.toThrow(
        "[Search] Query too short"
      );

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should throw error for query longer than 500 characters", async () => {
      const longQuery = "a".repeat(501);

      await expect(searchService.search({ q: longQuery })).rejects.toThrow(
        "[Search] Query too long"
      );

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should accept query with exactly 500 characters", async () => {
      const query = "a".repeat(500);
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.search({ q: query });

      expect(apiService.get).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it("should accept query with exactly 2 characters", async () => {
      const mockResults = {
        products: [{ id: "1", name: "AB Product" }],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.search({ q: "ab" });

      expect(apiService.get).toHaveBeenCalled();
      expect(result).toEqual(mockResults);
    });

    it("should trim whitespace from query", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "  laptop  " });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("q=laptop")
      );
    });

    it("should prevent DoS with extremely long queries", async () => {
      const queries = ["a".repeat(1000), "a".repeat(5000), "a".repeat(10000)];

      for (const query of queries) {
        await expect(searchService.search({ q: query })).rejects.toThrow(
          "[Search] Query too long"
        );
      }

      // No API calls should be made
      expect(apiService.get).not.toHaveBeenCalled();
    });
  });

  describe("search limit validation", () => {
    it("should cap limit at 100", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop", limit: 500 });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("limit=100");
    });

    it("should accept limit less than or equal to 100", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop", limit: 50 });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("limit=50");
    });

    it("should ignore negative limit", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop", limit: -10 });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toContain("limit=");
    });

    it("should ignore zero limit", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop", limit: 0 });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toContain("limit=");
    });

    it("should prevent DoS with extremely large limit values", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop", limit: 999999 });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("limit=100"); // Capped at 100
    });
  });

  describe("quickSearch validation", () => {
    it("should apply same validation rules as search", async () => {
      await expect(searchService.quickSearch("a")).rejects.toThrow(
        "[Search] Query too short"
      );
    });

    it("should set limit to 5", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.quickSearch("laptop");

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("limit=5");
    });
  });

  describe("Special characters in query", () => {
    it("should handle queries with special characters", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const specialQueries = [
        "laptop & desktop",
        "price: $100",
        'size: 15"',
        "brand: C++",
        "model #123",
      ];

      for (const query of specialQueries) {
        (apiService.get as jest.Mock).mockClear();
        await searchService.search({ q: query });
        expect(apiService.get).toHaveBeenCalled();
      }
    });

    it("should handle queries with unicode characters", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "लैपटॉप" }); // Hindi for laptop

      expect(apiService.get).toHaveBeenCalled();
    });

    it("should handle queries with emojis", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "laptop 💻" });

      expect(apiService.get).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should return empty results on API error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await searchService.search({ q: "laptop" });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
    });

    it("should handle null results from API", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(null);

      const result = await searchService.search({ q: "laptop" });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
    });

    it("should handle undefined results from API", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(undefined);

      const result = await searchService.search({ q: "laptop" });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
    });

    it("should handle partial results from API", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        products: [{ id: "1" }],
        // shops and categories missing
      });

      const result = await searchService.search({ q: "laptop" });

      expect(result.products).toEqual([{ id: "1" }]);
      expect(result.shops).toEqual([]);
      expect(result.categories).toEqual([]);
    });
  });

  describe("Performance", () => {
    it("should not make API call for empty query", async () => {
      await searchService.search({ q: "" });
      await searchService.search({ q: "  " });

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should not make API call for too short query", async () => {
      await expect(searchService.search({ q: "a" })).rejects.toThrow();

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should not make API call for too long query", async () => {
      await expect(
        searchService.search({ q: "a".repeat(501) })
      ).rejects.toThrow();

      expect(apiService.get).not.toHaveBeenCalled();
    });

    it("should validate query before making expensive API calls", async () => {
      const invalidQueries = ["", "  ", "a", "a".repeat(501), "a".repeat(1000)];

      for (const query of invalidQueries) {
        (apiService.get as jest.Mock).mockClear();
        try {
          await searchService.search({ q: query });
        } catch {
          // Expected to throw for some queries
        }
      }

      // No API calls should be made for any invalid query
      expect(apiService.get).not.toHaveBeenCalled();
    });
  });
});
