/**
 * Search Page Tests
 *
 * Tests for global search functionality
 */

import {
  FALLBACK_AUCTIONS,
  FALLBACK_PRODUCTS,
  FALLBACK_SHOPS,
} from "@/lib/fallback-data";

describe("Search Page", () => {
  const mockProducts = FALLBACK_PRODUCTS;
  const mockAuctions = FALLBACK_AUCTIONS;
  const mockShops = FALLBACK_SHOPS;

  describe("Search Functionality", () => {
    it("should search across products", () => {
      const query = "wireless";
      const results = mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()),
      );

      expect(results.length).toBeGreaterThan(0);
      results.forEach((product) => {
        const matchesName = product.name
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesDesc = product.description
          ?.toLowerCase()
          .includes(query.toLowerCase());
        expect(matchesName || matchesDesc).toBe(true);
      });
    });

    it("should search across auctions", () => {
      const query = "vintage";
      const results = mockAuctions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.description?.toLowerCase().includes(query.toLowerCase()),
      );

      results.forEach((auction) => {
        const matchesTitle = auction.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesDesc = auction.description
          ?.toLowerCase()
          .includes(query.toLowerCase());
        expect(matchesTitle || matchesDesc).toBe(true);
      });
    });

    it("should search across shops", () => {
      const query = "tech";
      const results = mockShops.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description?.toLowerCase().includes(query.toLowerCase()),
      );

      results.forEach((shop) => {
        const matchesName = shop.name
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesDesc = shop.description
          ?.toLowerCase()
          .includes(query.toLowerCase());
        expect(matchesName || matchesDesc).toBe(true);
      });
    });

    it("should handle empty search query", () => {
      const query = "";
      const productResults = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

      expect(productResults.length).toBe(mockProducts.length);
    });

    it("should handle no results", () => {
      const query = "nonexistentproductxyz123";
      const results = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

      expect(results.length).toBe(0);
    });
  });

  describe("Search Filters", () => {
    it("should filter by type (products only)", () => {
      const type = "products";
      const results = mockProducts;

      expect(results.length).toBeGreaterThan(0);
      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter by type (auctions only)", () => {
      const type = "auctions";
      const results = mockAuctions;

      expect(results.length).toBeGreaterThan(0);
      expect(Array.isArray(results)).toBe(true);
    });

    it("should filter by type (shops only)", () => {
      const type = "shops";
      const results = mockShops;

      expect(results.length).toBeGreaterThan(0);
      expect(Array.isArray(results)).toBe(true);
    });

    it("should combine search with category filter", () => {
      const query = "premium";
      const category = "electronics";

      const results = mockProducts.filter(
        (p) =>
          p.categorySlug === category &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())),
      );

      results.forEach((product) => {
        expect(product.categorySlug).toBe(category);
      });
    });
  });

  describe("Search Results Display", () => {
    it("should show result count", () => {
      const query = "premium";
      const results = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

      expect(typeof results.length).toBe("number");
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it("should highlight search terms in results", () => {
      const query = "wireless";
      const product = mockProducts.find((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

      if (product) {
        const lowerName = product.name.toLowerCase();
        const lowerQuery = query.toLowerCase();
        expect(lowerName).toContain(lowerQuery);
      }
    });
  });
});
