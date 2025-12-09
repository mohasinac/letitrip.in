/**
 * Unit Tests for ComparisonContext
 *
 * Tests product comparison functionality, localStorage persistence,
 * cross-tab synchronization, and max/min product limits
 */

import { COMPARISON_CONFIG } from "@/constants/comparison";
import {
  ComparisonProduct,
  comparisonService,
} from "@/services/comparison.service";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { ComparisonProvider, useComparison } from "../ComparisonContext";

// Mock comparison service
jest.mock("@/services/comparison.service", () => ({
  comparisonService: {
    getComparisonProducts: jest.fn(),
    addToComparison: jest.fn(),
    removeFromComparison: jest.fn(),
    clearComparison: jest.fn(),
  },
  COMPARISON_CONFIG: {
    MAX_PRODUCTS: 4,
    MIN_PRODUCTS: 2,
    STORAGE_KEY: "jfv-comparison",
  },
}));

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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

const createMockProduct = (id: string): ComparisonProduct => ({
  id,
  name: `Product ${id}`,
  price: 100,
  category: "Electronics",
  image: `https://example.com/${id}.jpg`,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ComparisonProvider>{children}</ComparisonProvider>
);

describe("ComparisonContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue([]);
  });

  describe("Initialization", () => {
    it("should initialize with empty comparison", () => {
      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.products).toEqual([]);
      expect(result.current.productIds).toEqual([]);
      expect(result.current.count).toBe(0);
      expect(result.current.canAddMore).toBe(true);
      expect(result.current.canCompare).toBe(false);
    });

    it("should load products from service on mount", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.count).toBe(2);
    });

    it("should throw error when used outside provider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useComparison());
      }).toThrow("useComparison must be used within a ComparisonProvider");

      consoleError.mockRestore();
    });
  });

  describe("Adding Products", () => {
    it("should add product successfully", () => {
      (comparisonService.addToComparison as jest.Mock).mockReturnValue(true);
      const mockProduct = createMockProduct("1");
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue([
        mockProduct,
      ]);

      const { result } = renderHook(() => useComparison(), { wrapper });

      let success: boolean;
      act(() => {
        success = result.current.addToComparison(mockProduct);
      });

      expect(success!).toBe(true);
      expect(comparisonService.addToComparison).toHaveBeenCalledWith(
        mockProduct
      );
      expect(result.current.products).toHaveLength(1);
    });

    it("should return false when add fails", () => {
      (comparisonService.addToComparison as jest.Mock).mockReturnValue(false);
      const mockProduct = createMockProduct("1");

      const { result } = renderHook(() => useComparison(), { wrapper });

      let success: boolean;
      act(() => {
        success = result.current.addToComparison(mockProduct);
      });

      expect(success!).toBe(false);
      expect(result.current.products).toHaveLength(0);
    });

    it("should update product IDs after adding", () => {
      const mockProduct = createMockProduct("1");
      (comparisonService.addToComparison as jest.Mock).mockReturnValue(true);
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue([
        mockProduct,
      ]);

      const { result } = renderHook(() => useComparison(), { wrapper });

      act(() => {
        result.current.addToComparison(mockProduct);
      });

      expect(result.current.productIds).toEqual(["1"]);
    });

    it("should handle maximum products limit", () => {
      const mockProducts = [
        createMockProduct("1"),
        createMockProduct("2"),
        createMockProduct("3"),
        createMockProduct("4"),
      ];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.canAddMore).toBe(false);
      expect(result.current.count).toBe(4);
    });
  });

  describe("Removing Products", () => {
    it("should remove product by ID", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock)
        .mockReturnValueOnce(mockProducts)
        .mockReturnValueOnce([mockProducts[1]]);

      const { result } = renderHook(() => useComparison(), { wrapper });

      act(() => {
        result.current.removeFromComparison("1");
      });

      expect(comparisonService.removeFromComparison).toHaveBeenCalledWith("1");
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].id).toBe("2");
    });

    it("should update product IDs after removing", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock)
        .mockReturnValueOnce(mockProducts)
        .mockReturnValueOnce([mockProducts[1]]);

      const { result } = renderHook(() => useComparison(), { wrapper });

      act(() => {
        result.current.removeFromComparison("1");
      });

      expect(result.current.productIds).toEqual(["2"]);
    });
  });

  describe("Clearing Comparison", () => {
    it("should clear all products", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      act(() => {
        result.current.clearComparison();
      });

      expect(comparisonService.clearComparison).toHaveBeenCalled();
      expect(result.current.products).toEqual([]);
      expect(result.current.count).toBe(0);
    });
  });

  describe("Checking Products", () => {
    it("should return true if product is in comparison", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.isInComparison("1")).toBe(true);
      expect(result.current.isInComparison("2")).toBe(true);
    });

    it("should return false if product is not in comparison", () => {
      const mockProducts = [createMockProduct("1")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.isInComparison("2")).toBe(false);
    });
  });

  describe("Comparison Limits", () => {
    it("should allow adding when below max", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.canAddMore).toBe(true);
    });

    it("should not allow adding when at max", () => {
      const mockProducts = [
        createMockProduct("1"),
        createMockProduct("2"),
        createMockProduct("3"),
        createMockProduct("4"),
      ];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.canAddMore).toBe(false);
    });

    it("should allow comparison when min products met", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.canCompare).toBe(true);
    });

    it("should not allow comparison when below min products", () => {
      const mockProducts = [createMockProduct("1")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.canCompare).toBe(false);
    });
  });

  describe("Cross-Tab Synchronization", () => {
    it("should listen to storage events", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      renderHook(() => useComparison(), { wrapper });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      );
    });

    it("should update products when storage event occurs", () => {
      const initialProducts = [createMockProduct("1")];
      const newProducts = [createMockProduct("1"), createMockProduct("2")];

      (comparisonService.getComparisonProducts as jest.Mock)
        .mockReturnValueOnce(initialProducts)
        .mockReturnValueOnce(newProducts);

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.products).toHaveLength(1);

      act(() => {
        const event = new StorageEvent("storage", {
          key: COMPARISON_CONFIG.STORAGE_KEY,
          newValue: JSON.stringify(newProducts),
        });
        window.dispatchEvent(event);
      });

      expect(result.current.products).toHaveLength(2);
    });

    it("should ignore storage events for other keys", () => {
      const mockProducts = [createMockProduct("1")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      const originalCount = result.current.count;

      act(() => {
        const event = new StorageEvent("storage", {
          key: "other-key",
          newValue: "some-value",
        });
        window.dispatchEvent(event);
      });

      expect(result.current.count).toBe(originalCount);
    });

    it("should cleanup event listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useComparison(), { wrapper });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty initial state", () => {
      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.products).toEqual([]);
      expect(result.current.productIds).toEqual([]);
      expect(result.current.count).toBe(0);
    });

    it("should handle service errors gracefully", () => {
      (comparisonService.addToComparison as jest.Mock).mockImplementation(
        () => {
          throw new Error("Service error");
        }
      );

      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(() => {
        act(() => {
          result.current.addToComparison(createMockProduct("1"));
        });
      }).toThrow("Service error");
    });

    it("should maintain max products constant", () => {
      const { result } = renderHook(() => useComparison(), { wrapper });

      expect(result.current.maxProducts).toBe(COMPARISON_CONFIG.MAX_PRODUCTS);
    });
  });

  describe("Performance", () => {
    it("should memoize product IDs", () => {
      const mockProducts = [createMockProduct("1"), createMockProduct("2")];
      (comparisonService.getComparisonProducts as jest.Mock).mockReturnValue(
        mockProducts
      );

      const { result, rerender } = renderHook(() => useComparison(), {
        wrapper,
      });

      const firstProductIds = result.current.productIds;

      rerender();

      // Should be the same reference
      expect(result.current.productIds).toBe(firstProductIds);
    });
  });
});
