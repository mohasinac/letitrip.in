/**
 * Comparison Service - Comprehensive Edge Case Tests
 * Tests error handling, localStorage edge cases, validation, max limits
 */

import type { ProductCardProps } from "@/components/cards/ProductCard";
import { comparisonService } from "../comparison.service";

type ComparisonProduct = Pick<
  ProductCardProps,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "originalPrice"
  | "image"
  | "rating"
  | "reviewCount"
  | "shopName"
  | "shopSlug"
  | "inStock"
  | "condition"
>;

describe("ComparisonService - Comprehensive Tests", () => {
  const mockProduct: ComparisonProduct = {
    id: "product1",
    name: "Test Product",
    slug: "test-product",
    price: 1000,
    image: "/test.jpg",
  };

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("BUG FIX #28 - Error Logging", () => {
    it("should log error when localStorage parsing fails", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Set invalid JSON in localStorage
      localStorage.setItem("product_comparison", "invalid json {");

      const result = comparisonService.getComparisonProducts();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[Comparison] Failed to parse comparison products:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should log error when localStorage.setItem fails", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[Comparison] Failed to add product to comparison:",
        expect.any(Error)
      );

      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("getComparisonProducts", () => {
    it("should return empty array when localStorage is empty", () => {
      const result = comparisonService.getComparisonProducts();
      expect(result).toEqual([]);
    });

    it("should handle SSR environment (no window)", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const result = comparisonService.getComparisonProducts();
      expect(result).toEqual([]);

      (global as any).window = originalWindow;
    });

    it("should return empty array for corrupted JSON", () => {
      localStorage.setItem("product_comparison", "not valid json");

      const result = comparisonService.getComparisonProducts();
      expect(result).toEqual([]);
    });

    it("should handle null values in localStorage", () => {
      localStorage.setItem("product_comparison", "null");

      const result = comparisonService.getComparisonProducts();
      // BUG FIX #28: Service now handles null from JSON.parse
      expect(result).toEqual([]);
    });
  });

  describe("getComparisonProductIds", () => {
    it("should return empty array when no products", () => {
      const result = comparisonService.getComparisonProductIds();
      expect(result).toEqual([]);
    });

    it("should return array of product IDs", () => {
      const products: ComparisonProduct[] = [
        { ...mockProduct, id: "p1" },
        { ...mockProduct, id: "p2" },
        { ...mockProduct, id: "p3" },
      ];
      localStorage.setItem("product_comparison", JSON.stringify(products));

      const result = comparisonService.getComparisonProductIds();
      expect(result).toEqual(["p1", "p2", "p3"]);
    });
  });

  describe("addToComparison", () => {
    it("should add product successfully", () => {
      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(true);
      const stored = comparisonService.getComparisonProducts();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(mockProduct);
    });

    it("should not add duplicate product", () => {
      comparisonService.addToComparison(mockProduct);
      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      const stored = comparisonService.getComparisonProducts();
      expect(stored).toHaveLength(1);
    });

    it("should not add more than max products (4)", () => {
      // Add 4 products
      for (let i = 0; i < 4; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `product${i}`,
        });
      }

      // Try to add 5th
      const result = comparisonService.addToComparison({
        ...mockProduct,
        id: "product5",
      });

      expect(result).toBe(false);
      const stored = comparisonService.getComparisonProducts();
      expect(stored).toHaveLength(4);
    });

    it("should reject addToComparison when localStorage throws", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage not available");
      });

      const result = comparisonService.addToComparison(mockProduct);
      expect(result).toBe(false);

      Storage.prototype.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe("removeFromComparison", () => {
    beforeEach(() => {
      const products: ComparisonProduct[] = [
        { ...mockProduct, id: "p1" },
        { ...mockProduct, id: "p2" },
        { ...mockProduct, id: "p3" },
      ];
      localStorage.setItem("product_comparison", JSON.stringify(products));
    });

    it("should remove product by ID", () => {
      comparisonService.removeFromComparison("p2");

      const stored = comparisonService.getComparisonProducts();
      expect(stored).toHaveLength(2);
      expect(stored.map((p) => p.id)).toEqual(["p1", "p3"]);
    });

    it("should handle removing non-existent product", () => {
      comparisonService.removeFromComparison("nonexistent");

      const stored = comparisonService.getComparisonProducts();
      expect(stored).toHaveLength(3);
    });

    it("should handle SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      // Should not throw in SSR
      comparisonService.removeFromComparison("p1");

      (global as any).window = originalWindow;
    });
  });

  describe("clearComparison", () => {
    it("should clear all products", () => {
      const products: ComparisonProduct[] = [
        mockProduct,
        { ...mockProduct, id: "p2" },
      ];
      localStorage.setItem("product_comparison", JSON.stringify(products));

      comparisonService.clearComparison();

      const stored = comparisonService.getComparisonProducts();
      expect(stored).toEqual([]);
    });

    it("should handle SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      comparisonService.clearComparison();

      (global as any).window = originalWindow;
    });
  });

  describe("isInComparison", () => {
    beforeEach(() => {
      const products: ComparisonProduct[] = [
        { ...mockProduct, id: "p1" },
        { ...mockProduct, id: "p2" },
      ];
      localStorage.setItem("product_comparison", JSON.stringify(products));
    });

    it("should return true for products in comparison", () => {
      expect(comparisonService.isInComparison("p1")).toBe(true);
      expect(comparisonService.isInComparison("p2")).toBe(true);
    });

    it("should return false for products not in comparison", () => {
      expect(comparisonService.isInComparison("p3")).toBe(false);
      expect(comparisonService.isInComparison("nonexistent")).toBe(false);
    });

    it("should handle empty comparison", () => {
      localStorage.clear();
      expect(comparisonService.isInComparison("p1")).toBe(false);
    });
  });

  describe("getComparisonCount", () => {
    it("should return count of products in comparison", () => {
      expect(comparisonService.getComparisonCount()).toBe(0);

      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.getComparisonCount()).toBe(1);

      comparisonService.addToComparison({ ...mockProduct, id: "p2" });
      expect(comparisonService.getComparisonCount()).toBe(2);
    });
  });

  describe("canAddMore", () => {
    it("should return true when under max", () => {
      expect(comparisonService.canAddMore()).toBe(true);

      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.canAddMore()).toBe(true);
    });

    it("should return false when at max (4)", () => {
      for (let i = 0; i < 4; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `product${i}`,
        });
      }

      expect(comparisonService.canAddMore()).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle products with missing optional fields", () => {
      const minimalProduct: ComparisonProduct = {
        id: "minimal",
        name: "Minimal Product",
        slug: "minimal",
        price: 100,
        image: "/min.jpg",
      };

      const result = comparisonService.addToComparison(minimalProduct);
      expect(result).toBe(true);

      const stored = comparisonService.getComparisonProducts();
      expect(stored[0]).toEqual(minimalProduct);
    });

    it("should handle products with zero price", () => {
      const freeProduct = { ...mockProduct, price: 0 };
      const result = comparisonService.addToComparison(freeProduct);
      expect(result).toBe(true);
    });

    it("should handle products with all optional fields", () => {
      const fullProduct: ComparisonProduct = {
        id: "full",
        name: "Full Product",
        slug: "full-product",
        price: 1000,
        originalPrice: 1500,
        image: "/full.jpg",
        rating: 4.5,
        reviewCount: 100,
        shopName: "Test Shop",
        shopSlug: "test-shop",
        inStock: true,
        condition: "New",
      };

      const result = comparisonService.addToComparison(fullProduct);
      expect(result).toBe(true);
    });

    it("should handle very long product names", () => {
      const longName = "A".repeat(1000);
      const product = { ...mockProduct, name: longName };
      const result = comparisonService.addToComparison(product);
      expect(result).toBe(true);

      const stored = comparisonService.getComparisonProducts();
      expect(stored[0].name).toBe(longName);
    });

    it("should handle special characters in product data", () => {
      const specialProduct = {
        ...mockProduct,
        name: "Test <script>alert('xss')</script> Product",
        slug: "test-product-🎉-special",
      };

      const result = comparisonService.addToComparison(specialProduct);
      expect(result).toBe(true);
    });

    it("should handle concurrent operations", () => {
      // Simulate rapid additions
      const promises = Array.from({ length: 4 }, (_, i) =>
        Promise.resolve(
          comparisonService.addToComparison({
            ...mockProduct,
            id: `product${i}`,
          })
        )
      );

      return Promise.all(promises).then(() => {
        const products = comparisonService.getComparisonProducts();
        expect(products).toHaveLength(4);
      });
    });
  });

  describe("Data Integrity", () => {
    it("should preserve data after multiple add/remove operations", () => {
      // Add products
      comparisonService.addToComparison({ ...mockProduct, id: "p1" });
      comparisonService.addToComparison({ ...mockProduct, id: "p2" });
      comparisonService.addToComparison({ ...mockProduct, id: "p3" });

      // Remove one
      comparisonService.removeFromComparison("p2");

      // Add another
      comparisonService.addToComparison({ ...mockProduct, id: "p4" });

      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(3);
      expect(products.find((p) => p.id === "p2")).toBeUndefined();
      expect(products.find((p) => p.id === "p4")).toBeDefined();
    });

    it("should maintain correct product order", () => {
      comparisonService.addToComparison({ ...mockProduct, id: "p1" });
      comparisonService.addToComparison({ ...mockProduct, id: "p2" });
      comparisonService.addToComparison({ ...mockProduct, id: "p3" });

      const products = comparisonService.getComparisonProducts();
      expect(products[0].id).toBe("p1");
      expect(products[1].id).toBe("p2");
      expect(products[2].id).toBe("p3");
    });
  });

  describe("Performance", () => {
    it("should handle maximum capacity efficiently", () => {
      const start = Date.now();

      for (let i = 0; i < 4; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `product${i}`,
        });
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should be very fast

      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(4);
    });
  });
});
