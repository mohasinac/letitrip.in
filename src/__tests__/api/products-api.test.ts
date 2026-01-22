/**
 * Products API Tests
 *
 * Tests for product API endpoints using fallback data
 */

import { FALLBACK_PRODUCTS, getPaginatedFallback } from "@/lib/fallback-data";

describe("Products API", () => {
  describe("GET /api/products", () => {
    it("should return all products", () => {
      const products = FALLBACK_PRODUCTS;

      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it("should return products with correct structure", () => {
      const product = FALLBACK_PRODUCTS[0];

      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("images");
      expect(product).toHaveProperty("rating");
      expect(product).toHaveProperty("reviewCount");
      expect(product).toHaveProperty("stock");
      expect(product).toHaveProperty("status");
      expect(product).toHaveProperty("shopName");
      expect(product).toHaveProperty("category");
    });

    it("should support pagination", () => {
      const page = 1;
      const limit = 12;
      const result = getPaginatedFallback(FALLBACK_PRODUCTS, page, limit);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("hasMore");
      expect(result).toHaveProperty("nextCursor");
      expect(result.data.length).toBeLessThanOrEqual(limit);
    });

    it("should filter by category", () => {
      const category = "electronics";
      const filtered = FALLBACK_PRODUCTS.filter(
        (p) => p.categorySlug === category,
      );

      expect(filtered.every((p) => p.categorySlug === category)).toBe(true);
    });

    it("should filter by price range", () => {
      const minPrice = 500;
      const maxPrice = 3000;
      const filtered = FALLBACK_PRODUCTS.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice,
      );

      filtered.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });

    it("should filter featured products", () => {
      const featured = FALLBACK_PRODUCTS.filter((p) => p.featured);

      expect(featured.every((p) => p.featured === true)).toBe(true);
    });

    it("should filter in-stock products", () => {
      const inStock = FALLBACK_PRODUCTS.filter((p) => p.stock > 0);

      expect(inStock.every((p) => p.stock > 0)).toBe(true);
    });

    it("should search products by name", () => {
      const query = "wireless";
      const results = FALLBACK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      );

      results.forEach((product) => {
        expect(product.name.toLowerCase()).toContain(query.toLowerCase());
      });
    });
  });

  describe("GET /api/products/[slug]", () => {
    it("should return product by slug", () => {
      const slug = FALLBACK_PRODUCTS[0].slug;
      const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);

      expect(product).toBeDefined();
      expect(product?.slug).toBe(slug);
    });

    it("should return undefined for non-existent slug", () => {
      const slug = "non-existent-product";
      const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug);

      expect(product).toBeUndefined();
    });
  });

  describe("Product Sorting", () => {
    it("should sort by price ascending", () => {
      const sorted = [...FALLBACK_PRODUCTS].sort((a, b) => a.price - b.price);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeLessThanOrEqual(sorted[i + 1].price);
      }
    });

    it("should sort by price descending", () => {
      const sorted = [...FALLBACK_PRODUCTS].sort((a, b) => b.price - a.price);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i + 1].price);
      }
    });

    it("should sort by rating", () => {
      const sorted = [...FALLBACK_PRODUCTS].sort((a, b) => b.rating - a.rating);

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].rating).toBeGreaterThanOrEqual(sorted[i + 1].rating);
      }
    });

    it("should sort by popularity", () => {
      const sorted = [...FALLBACK_PRODUCTS].sort(
        (a, b) => b.viewCount - a.viewCount,
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].viewCount).toBeGreaterThanOrEqual(
          sorted[i + 1].viewCount,
        );
      }
    });

    it("should sort by newest", () => {
      const sorted = [...FALLBACK_PRODUCTS].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          sorted[i + 1].createdAt.getTime(),
        );
      }
    });
  });
});
