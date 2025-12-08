import { COMPARISON_CONFIG } from "@/constants/comparison";
import {
  comparisonService,
  type ComparisonProduct,
} from "../comparison.service";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("ComparisonService", () => {
  const mockProduct: ComparisonProduct = {
    id: "prod_1",
    name: "Test Product",
    slug: "test-product",
    price: 100,
    originalPrice: 150,
    image: "/test.jpg",
    rating: 4.5,
    reviewCount: 10,
    shopName: "Test Shop",
    shopSlug: "test-shop",
    inStock: true,
    condition: "new" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("getComparisonProducts", () => {
    it("should return empty array when no products in storage", () => {
      const result = comparisonService.getComparisonProducts();

      expect(result).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        COMPARISON_CONFIG.STORAGE_KEY
      );
    });

    it("should return products from localStorage", () => {
      const products = [mockProduct];
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );

      const result = comparisonService.getComparisonProducts();

      expect(result).toEqual(products);
    });

    it("should return empty array on parse error", () => {
      localStorageMock.setItem(COMPARISON_CONFIG.STORAGE_KEY, "invalid-json");

      const result = comparisonService.getComparisonProducts();

      expect(result).toEqual([]);
    });

    it("should return empty array in SSR environment", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = comparisonService.getComparisonProducts();

      expect(result).toEqual([]);
      global.window = originalWindow as any;
    });
  });

  describe("getComparisonProductIds", () => {
    it("should return empty array when no products", () => {
      const result = comparisonService.getComparisonProductIds();

      expect(result).toEqual([]);
    });

    it("should return array of product IDs", () => {
      const products = [
        { ...mockProduct, id: "prod_1" },
        { ...mockProduct, id: "prod_2" },
      ];
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );

      const result = comparisonService.getComparisonProductIds();

      expect(result).toEqual(["prod_1", "prod_2"]);
    });
  });

  describe("addToComparison", () => {
    it("should add product to comparison", () => {
      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct])
      );
    });

    it("should return false if product already in comparison", () => {
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct])
      );
      jest.clearAllMocks(); // Clear the setItem from setup

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should return false if max products reached", () => {
      const maxProducts = Array.from(
        { length: COMPARISON_CONFIG.MAX_PRODUCTS },
        (_, i) => ({
          ...mockProduct,
          id: `prod_${i}`,
        })
      );
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(maxProducts)
      );

      const newProduct = { ...mockProduct, id: "prod_new" };
      const result = comparisonService.addToComparison(newProduct);

      expect(result).toBe(false);
    });

    it("should return false in SSR environment", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = comparisonService.addToComparison(mockProduct);

      expect(result).toBe(false);
      global.window = originalWindow as any;
    });
  });

  describe("removeFromComparison", () => {
    it("should remove product from comparison", () => {
      const products = [
        { ...mockProduct, id: "prod_1" },
        { ...mockProduct, id: "prod_2" },
      ];
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );
      jest.clearAllMocks();

      comparisonService.removeFromComparison("prod_1");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([{ ...mockProduct, id: "prod_2" }])
      );
    });

    it("should do nothing if product not found", () => {
      const products = [mockProduct];
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );
      jest.clearAllMocks();

      comparisonService.removeFromComparison("nonexistent");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );
    });

    it("should handle SSR environment gracefully", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        comparisonService.removeFromComparison("prod_1");
      }).not.toThrow();

      global.window = originalWindow as any;
    });

    it("should handle storage errors gracefully", () => {
      localStorageMock.clear();
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error("Storage error");
      });

      expect(() => {
        comparisonService.removeFromComparison("prod_1");
      }).not.toThrow();
    });
  });

  describe("clearComparison", () => {
    it("should clear all products from comparison", () => {
      const products = [mockProduct];
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );
      jest.clearAllMocks();

      comparisonService.clearComparison();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        COMPARISON_CONFIG.STORAGE_KEY
      );
    });

    it("should handle SSR environment gracefully", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        comparisonService.clearComparison();
      }).not.toThrow();

      global.window = originalWindow as any;
    });
  });

  describe("getComparisonCount", () => {
    it("should return 0 when no products", () => {
      localStorageMock.clear();
      const result = comparisonService.getComparisonCount();

      expect(result).toBe(0);
    });

    it("should return count of products in comparison", () => {
      const products = [
        { ...mockProduct, id: "prod_1" },
        { ...mockProduct, id: "prod_2" },
        { ...mockProduct, id: "prod_3" },
      ];
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );

      const result = comparisonService.getComparisonCount();

      expect(result).toBe(3);
    });
  });

  describe("isInComparison", () => {
    it("should return false when product not in comparison", () => {
      localStorageMock.clear();
      const result = comparisonService.isInComparison("prod_1");

      expect(result).toBe(false);
    });

    it("should return true when product in comparison", () => {
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct])
      );

      const result = comparisonService.isInComparison(mockProduct.id);

      expect(result).toBe(true);
    });
  });

  describe("canAddMore", () => {
    it("should return true when below max", () => {
      localStorageMock.clear();
      const result = comparisonService.canAddMore();

      expect(result).toBe(true);
    });

    it("should return false when at max", () => {
      const maxProducts = Array.from(
        { length: COMPARISON_CONFIG.MAX_PRODUCTS },
        (_, i) => ({
          ...mockProduct,
          id: `prod_${i}`,
        })
      );
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(maxProducts)
      );

      const result = comparisonService.canAddMore();

      expect(result).toBe(false);
    });
  });

  describe("canCompare", () => {
    it("should return false when below minimum", () => {
      localStorageMock.clear();
      const result = comparisonService.canCompare();

      expect(result).toBe(false);
    });

    it("should return false with one product", () => {
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify([mockProduct])
      );

      const result = comparisonService.canCompare();

      expect(result).toBe(false);
    });

    it("should return true when at minimum", () => {
      const minProducts = Array.from(
        { length: COMPARISON_CONFIG.MIN_PRODUCTS },
        (_, i) => ({
          ...mockProduct,
          id: `prod_${i}`,
        })
      );
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(minProducts)
      );

      const result = comparisonService.canCompare();

      expect(result).toBe(true);
    });

    it("should return true when above minimum", () => {
      const products = Array.from(
        { length: COMPARISON_CONFIG.MIN_PRODUCTS + 1 },
        (_, i) => ({
          ...mockProduct,
          id: `prod_${i}`,
        })
      );
      localStorageMock.clear();
      localStorageMock.setItem(
        COMPARISON_CONFIG.STORAGE_KEY,
        JSON.stringify(products)
      );

      const result = comparisonService.canCompare();

      expect(result).toBe(true);
    });
  });
});
