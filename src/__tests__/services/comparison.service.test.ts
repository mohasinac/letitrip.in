/**
 * Comparison Service Unit Tests
 * Tests localStorage-based product comparison functionality
 */

import { COMPARISON_CONFIG } from "@/constants/comparison";
import {
  comparisonService,
  type ComparisonProduct,
} from "@/services/comparison.service";

describe("ComparisonService", () => {
  const mockProduct: ComparisonProduct = {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    price: 1000,
    originalPrice: 1500,
    image: "/test.jpg",
    rating: 4.5,
    reviewCount: 10,
    shopName: "Test Shop",
    shopSlug: "test-shop",
    inStock: true,
    condition: "new",
  };

  const mockProduct2: ComparisonProduct = {
    ...mockProduct,
    id: "prod-2",
    name: "Test Product 2",
    slug: "test-product-2",
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("getComparisonProducts", () => {
    it("should return empty array when no products in comparison", () => {
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });

    it("should return products from localStorage", () => {
      localStorage.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct])
      );
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([mockProduct]);
      expect(products).toHaveLength(1);
    });

    it("should return empty array on JSON parse error", () => {
      localStorage.setItem(COMPARISON_CONFIG.STORAGE_KEY, "invalid-json");
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });

    it("should handle missing localStorage gracefully", () => {
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });
  });

  describe("getComparisonProductIds", () => {
    it("should return empty array when no products", () => {
      const ids = comparisonService.getComparisonProductIds();
      expect(ids).toEqual([]);
    });

    it("should return array of product IDs", () => {
      localStorage.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct, mockProduct2])
      );
      const ids = comparisonService.getComparisonProductIds();
      expect(ids).toEqual(["prod-1", "prod-2"]);
    });
  });

  describe("addToComparison", () => {
    it("should add product to empty comparison", () => {
      const result = comparisonService.addToComparison(mockProduct);
      expect(result).toBe(true);
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([mockProduct]);
    });

    it("should add product to existing comparison", () => {
      comparisonService.addToComparison(mockProduct);
      const result = comparisonService.addToComparison(mockProduct2);
      expect(result).toBe(true);
      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(2);
    });

    it("should not add duplicate product", () => {
      comparisonService.addToComparison(mockProduct);
      const result = comparisonService.addToComparison(mockProduct);
      expect(result).toBe(false);
      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(1);
    });

    it("should not add product when max limit reached", () => {
      // Add max products
      for (let i = 0; i < COMPARISON_CONFIG.MAX_PRODUCTS; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `prod-${i}`,
        });
      }

      // Try to add one more
      const result = comparisonService.addToComparison({
        ...mockProduct,
        id: "prod-overflow",
      });
      expect(result).toBe(false);
      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(COMPARISON_CONFIG.MAX_PRODUCTS);
    });

    it("should handle localStorage errors gracefully", () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const result = comparisonService.addToComparison(mockProduct);
      expect(result).toBe(false);

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("removeFromComparison", () => {
    it("should remove product from comparison", () => {
      comparisonService.addToComparison(mockProduct);
      comparisonService.addToComparison(mockProduct2);

      comparisonService.removeFromComparison("prod-1");
      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("prod-2");
    });

    it("should handle removing non-existent product", () => {
      comparisonService.addToComparison(mockProduct);
      comparisonService.removeFromComparison("non-existent");
      const products = comparisonService.getComparisonProducts();
      expect(products).toHaveLength(1);
    });

    it("should handle empty comparison", () => {
      comparisonService.removeFromComparison("prod-1");
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage error");
      });

      comparisonService.addToComparison(mockProduct);
      // Should not throw
      expect(() =>
        comparisonService.removeFromComparison("prod-1")
      ).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("clearComparison", () => {
    it("should clear all products from comparison", () => {
      comparisonService.addToComparison(mockProduct);
      comparisonService.addToComparison(mockProduct2);

      comparisonService.clearComparison();
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });

    it("should handle already empty comparison", () => {
      comparisonService.clearComparison();
      const products = comparisonService.getComparisonProducts();
      expect(products).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => comparisonService.clearComparison()).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });
  });

  describe("isInComparison", () => {
    it("should return true for product in comparison", () => {
      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.isInComparison("prod-1")).toBe(true);
    });

    it("should return false for product not in comparison", () => {
      expect(comparisonService.isInComparison("prod-1")).toBe(false);
    });

    it("should return false for empty comparison", () => {
      expect(comparisonService.isInComparison("any-id")).toBe(false);
    });
  });

  describe("getComparisonCount", () => {
    it("should return 0 for empty comparison", () => {
      expect(comparisonService.getComparisonCount()).toBe(0);
    });

    it("should return correct count", () => {
      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.getComparisonCount()).toBe(1);

      comparisonService.addToComparison(mockProduct2);
      expect(comparisonService.getComparisonCount()).toBe(2);
    });
  });

  describe("canAddMore", () => {
    it("should return true when below max limit", () => {
      expect(comparisonService.canAddMore()).toBe(true);
      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.canAddMore()).toBe(true);
    });

    it("should return false when at max limit", () => {
      for (let i = 0; i < COMPARISON_CONFIG.MAX_PRODUCTS; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `prod-${i}`,
        });
      }
      expect(comparisonService.canAddMore()).toBe(false);
    });
  });

  describe("canCompare", () => {
    it("should return false when below min products", () => {
      expect(comparisonService.canCompare()).toBe(false);
      comparisonService.addToComparison(mockProduct);
      expect(comparisonService.canCompare()).toBe(false);
    });

    it("should return true when at or above min products", () => {
      for (let i = 0; i < COMPARISON_CONFIG.MIN_PRODUCTS; i++) {
        comparisonService.addToComparison({
          ...mockProduct,
          id: `prod-${i}`,
        });
      }
      expect(comparisonService.canCompare()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle products with missing optional fields", () => {
      const minimalProduct: ComparisonProduct = {
        id: "minimal",
        name: "Minimal",
        slug: "minimal",
        price: 100,
        originalPrice: 100,
        image: "",
        rating: 0,
        reviewCount: 0,
        shopName: "",
        shopSlug: "",
        inStock: true,
        condition: "new",
      };

      const result = comparisonService.addToComparison(minimalProduct);
      expect(result).toBe(true);
    });

    it("should handle rapid add/remove operations", () => {
      for (let i = 0; i < 10; i++) {
        comparisonService.addToComparison({ ...mockProduct, id: `prod-${i}` });
        if (i % 2 === 0) {
          comparisonService.removeFromComparison(`prod-${i}`);
        }
      }

      const products = comparisonService.getComparisonProducts();
      expect(products.length).toBeLessThanOrEqual(
        COMPARISON_CONFIG.MAX_PRODUCTS
      );
    });

    it("should maintain data integrity across operations", () => {
      comparisonService.addToComparison(mockProduct);
      const beforeClear = comparisonService.getComparisonProducts();
      expect(beforeClear[0]).toEqual(mockProduct);

      comparisonService.clearComparison();
      const afterClear = comparisonService.getComparisonProducts();
      expect(afterClear).toEqual([]);

      comparisonService.addToComparison(mockProduct2);
      const afterAdd = comparisonService.getComparisonProducts();
      expect(afterAdd[0]).toEqual(mockProduct2);
    });
  });
});
