import { apiService } from "../api.service";
import { searchService } from "../search.service";

// Mock the api service
jest.mock("../api.service");

describe("SearchService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("search", () => {
    it("performs global search successfully", async () => {
      const mockResults = {
        products: [
          { id: "p1", name: "Product 1", type: "product" },
          { id: "p2", name: "Product 2", type: "product" },
        ],
        shops: [{ id: "s1", name: "Shop 1", type: "shop" }],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.search({ q: "test" });

      expect(result).toEqual(mockResults);
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("q=test")
      );
    });

    it("applies type filter", async () => {
      const mockResults = {
        products: [{ id: "p1", name: "Product 1", type: "product" }],
        shops: [],
        categories: [],
        total: 1,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "test", type: "product" });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("type=product")
      );
    });

    it("applies limit parameter", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "test", limit: 10 });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
    });

    it("handles empty query", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
        total: 0,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.search({ q: "" });

      expect(result.products).toEqual([]);
      expect(result.shops).toEqual([]);
      expect(result.categories).toEqual([]);
    });

    it("handles search errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Search failed")
      );

      const result = await searchService.search({ q: "test" });

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
    });

    it("encodes special characters in query", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      await searchService.search({ q: "test & special" });

      expect(apiService.get).toHaveBeenCalled();
      const calledUrl = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(calledUrl).toContain("q=test");
    });
  });

  describe("quickSearch", () => {
    it("performs quick search with limited results", async () => {
      const mockResults = {
        products: [
          { id: "p1", name: "Product 1" },
          { id: "p2", name: "Product 2" },
        ],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.quickSearch("test");

      expect(result).toEqual(mockResults);
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
    });

    it("returns limited results for autocomplete", async () => {
      const mockResults = {
        products: Array(5)
          .fill(null)
          .map((_, i) => ({ id: `p${i}`, name: `Product ${i}` })),
        shops: [],
        categories: [],
        total: 5,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.quickSearch("prod");

      expect(result.products).toHaveLength(5);
    });

    it("handles empty quick search", async () => {
      const mockResults = {
        products: [],
        shops: [],
        categories: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResults);

      const result = await searchService.quickSearch("");

      expect(result.products).toEqual([]);
      expect(result.shops).toEqual([]);
      expect(result.categories).toEqual([]);
    });

    it("handles quick search errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Search failed")
      );

      const result = await searchService.quickSearch("test");

      expect(result).toEqual({
        products: [],
        shops: [],
        categories: [],
      });
    });
  });
});
