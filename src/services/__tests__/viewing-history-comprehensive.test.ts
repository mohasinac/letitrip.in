/**
 * Viewing History Service - Comprehensive Edge Case Tests
 * Tests error handling, localStorage limits, data validation, expiration
 */

import type { ViewingHistoryItem } from "@/constants/navigation";
import { viewingHistoryService } from "../viewing-history.service";

describe("ViewingHistoryService - Comprehensive Tests", () => {
  const mockItem: Omit<ViewingHistoryItem, "viewed_at"> = {
    id: "product1",
    name: "Test Product",
    slug: "test-product",
    image: "/test.jpg",
    price: 1000,
    shopName: "Test Shop",
    inStock: true,
  };

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("BUG FIX #28 - Error Logging", () => {
    it("should log error when localStorage parsing fails in getHistory", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Set invalid JSON
      localStorage.setItem("viewing_history", "invalid json {");

      const result = viewingHistoryService.getHistory();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[ViewingHistory] Failed to get history:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getHistory", () => {
    it("should return empty array when no history", () => {
      const result = viewingHistoryService.getHistory();
      expect(result).toEqual([]);
    });

    it("should handle SSR environment (no window)", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      const result = viewingHistoryService.getHistory();
      expect(result).toEqual([]);

      (global as any).window = originalWindow;
    });

    it("should handle corrupted JSON", () => {
      localStorage.setItem("viewing_history", "not valid json");

      const result = viewingHistoryService.getHistory();
      expect(result).toEqual([]);
    });

    it("should handle null values in localStorage", () => {
      localStorage.setItem("viewing_history", "null");

      const result = viewingHistoryService.getHistory();
      expect(result).toEqual([]);
    });

    it("should filter out expired items", () => {
      const now = Date.now();
      const thirtyDaysAgo = now - 31 * 24 * 60 * 60 * 1000; // 31 days ago (expired)
      const oneDayAgo = now - 1 * 24 * 60 * 60 * 1000; // 1 day ago (valid)

      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "expired", viewed_at: thirtyDaysAgo },
        { ...mockItem, id: "valid", viewed_at: oneDayAgo },
      ];

      localStorage.setItem("viewing_history", JSON.stringify(items));

      const result = viewingHistoryService.getHistory();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("valid");
    });
  });

  describe("getRecentlyViewed", () => {
    it("should return limited number of items", () => {
      const items: ViewingHistoryItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          ...mockItem,
          id: `product${i}`,
          viewed_at: Date.now(),
        })
      );

      localStorage.setItem("viewing_history", JSON.stringify(items));

      const result = viewingHistoryService.getRecentlyViewed(5);
      expect(result).toHaveLength(5);
    });

    it("should default to 8 items", () => {
      const items: ViewingHistoryItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          ...mockItem,
          id: `product${i}`,
          viewed_at: Date.now(),
        })
      );

      localStorage.setItem("viewing_history", JSON.stringify(items));

      const result = viewingHistoryService.getRecentlyViewed();
      expect(result).toHaveLength(8);
    });
  });

  describe("addToHistory", () => {
    it("should add new item to history", () => {
      viewingHistoryService.addToHistory(mockItem);

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe(mockItem.id);
      expect(history[0].viewed_at).toBeDefined();
    });

    it("should move existing item to top with updated timestamp", () => {
      const firstView = { ...mockItem, viewed_at: 1000 };
      const secondView = { ...mockItem, viewed_at: 2000 };

      // Add first time
      localStorage.setItem("viewing_history", JSON.stringify([firstView]));

      // Add same item again
      viewingHistoryService.addToHistory(mockItem);

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].viewed_at).toBeGreaterThan(1000);
    });

    it("should maintain max 50 items", () => {
      // Add 50 items
      for (let i = 0; i < 50; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `product${i}`,
        });
      }

      // Add one more
      viewingHistoryService.addToHistory({
        ...mockItem,
        id: "product51",
      });

      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    it("should handle SSR environment gracefully", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      // Should not throw
      viewingHistoryService.addToHistory(mockItem);

      (global as any).window = originalWindow;
    });

    it("should not add items with empty id", () => {
      viewingHistoryService.addToHistory({
        ...mockItem,
        id: "",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should not add items with whitespace-only id", () => {
      viewingHistoryService.addToHistory({
        ...mockItem,
        id: "   ",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should not add items without name", () => {
      viewingHistoryService.addToHistory({
        ...mockItem,
        name: "" as any,
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should not add items without slug", () => {
      viewingHistoryService.addToHistory({
        ...mockItem,
        slug: "" as any,
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should not add items with invalid price", () => {
      viewingHistoryService.addToHistory({
        ...mockItem,
        price: "invalid" as any,
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe("removeFromHistory", () => {
    beforeEach(() => {
      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "p1", viewed_at: Date.now() },
        { ...mockItem, id: "p2", viewed_at: Date.now() },
        { ...mockItem, id: "p3", viewed_at: Date.now() },
      ];
      localStorage.setItem("viewing_history", JSON.stringify(items));
    });

    it("should remove item by id", () => {
      viewingHistoryService.removeFromHistory("p2");

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(2);
      expect(history.find((h) => h.id === "p2")).toBeUndefined();
    });

    it("should handle removing non-existent product", () => {
      viewingHistoryService.removeFromHistory("nonexistent");

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(3);
    });

    it("should handle SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      viewingHistoryService.removeFromHistory("p1");

      (global as any).window = originalWindow;
    });
  });

  describe("clearHistory", () => {
    it("should clear all history", () => {
      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "p1", viewed_at: Date.now() },
        { ...mockItem, id: "p2", viewed_at: Date.now() },
      ];
      localStorage.setItem("viewing_history", JSON.stringify(items));

      viewingHistoryService.clearHistory();

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should handle SSR environment", () => {
      const originalWindow = global.window;
      (global as any).window = undefined;

      viewingHistoryService.clearHistory();

      (global as any).window = originalWindow;
    });
  });

  describe("isInHistory", () => {
    beforeEach(() => {
      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "p1", viewed_at: Date.now() },
        { ...mockItem, id: "p2", viewed_at: Date.now() },
      ];
      localStorage.setItem("viewing_history", JSON.stringify(items));
    });

    it("should return true for products in history", () => {
      expect(viewingHistoryService.isInHistory("p1")).toBe(true);
      expect(viewingHistoryService.isInHistory("p2")).toBe(true);
    });

    it("should return false for products not in history", () => {
      expect(viewingHistoryService.isInHistory("p3")).toBe(false);
      expect(viewingHistoryService.isInHistory("nonexistent")).toBe(false);
    });

    it("should handle empty history", () => {
      localStorage.clear();
      expect(viewingHistoryService.isInHistory("p1")).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero price products", () => {
      const freeItem = { ...mockItem, price: 0 };
      viewingHistoryService.addToHistory(freeItem);

      const history = viewingHistoryService.getHistory();
      expect(history[0].price).toBe(0);
    });

    it("should handle very long product names", () => {
      const longName = "A".repeat(1000);
      const item = { ...mockItem, name: longName };
      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      expect(history[0].name).toBe(longName);
    });

    it("should handle special characters in data", () => {
      const specialItem = {
        ...mockItem,
        name: "Test <script>alert('xss')</script>",
        slug: "test-🎉-product",
      };

      viewingHistoryService.addToHistory(specialItem);

      const history = viewingHistoryService.getHistory();
      expect(history[0].name).toBe(specialItem.name);
    });

    it("should handle concurrent additions", () => {
      // Simulate rapid additions
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve(
          viewingHistoryService.addToHistory({
            ...mockItem,
            id: `product${i}`,
          })
        )
      );

      return Promise.all(promises).then(() => {
        const history = viewingHistoryService.getHistory();
        expect(history).toHaveLength(10);
      });
    });

    it("should preserve data integrity after multiple operations", () => {
      // Add items
      for (let i = 0; i < 10; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `product${i}`,
        });
      }

      // Remove some
      viewingHistoryService.removeFromHistory("product5");
      viewingHistoryService.removeFromHistory("product7");

      // Add more
      viewingHistoryService.addToHistory({
        ...mockItem,
        id: "product10",
      });

      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history.find((h) => h.id === "product5")).toBeUndefined();
      expect(history.find((h) => h.id === "product7")).toBeUndefined();
      expect(history.find((h) => h.id === "product10")).toBeDefined();
    });
  });

  describe("Performance", () => {
    it("should handle maximum capacity efficiently", () => {
      const start = Date.now();

      // Add 50 items (max capacity)
      for (let i = 0; i < 50; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `product${i}`,
        });
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second

      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    it("should handle large data retrieval efficiently", () => {
      // Add 50 items
      for (let i = 0; i < 50; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `product${i}`,
        });
      }

      const start = Date.now();
      const history = viewingHistoryService.getHistory();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should be very fast
      expect(history.length).toBeGreaterThan(0);
    });
  });
});
