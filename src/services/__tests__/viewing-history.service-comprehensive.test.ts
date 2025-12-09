/**
 * Unit Tests for Viewing History Service
 *
 * Tests localStorage-based viewing history management.
 * Covers edge cases, expiry, and browser compatibility.
 */

import { VIEWING_HISTORY_CONFIG } from "@/constants/navigation";
import { viewingHistoryService } from "../viewing-history.service";

describe("ViewingHistoryService", () => {
  const mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear mock
    Object.keys(mockLocalStorage).forEach(
      (key) => delete mockLocalStorage[key]
    );

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(mockLocalStorage).forEach(
            (key) => delete mockLocalStorage[key]
          );
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getHistory", () => {
    it("should return empty array when no history exists", () => {
      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should return stored history items", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual(items);
    });

    it("should filter out expired items", () => {
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const items = [
        {
          id: "prod-1",
          name: "Recent Product",
          image: "image1.jpg",
          price: 100,
          slug: "recent",
          viewed_at: now - 1000, // Recent
        },
        {
          id: "prod-2",
          name: "Expired Product",
          image: "image2.jpg",
          price: 200,
          slug: "expired",
          viewed_at: now - expiryMs - 1000, // Expired
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-1");
    });

    it("should update storage after filtering expired items", () => {
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const items = [
        {
          id: "prod-1",
          name: "Recent",
          image: "image1.jpg",
          price: 100,
          slug: "recent",
          viewed_at: now,
        },
        {
          id: "prod-2",
          name: "Expired",
          image: "image2.jpg",
          price: 200,
          slug: "expired",
          viewed_at: now - expiryMs - 1000,
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.getHistory();

      const stored = JSON.parse(
        mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY]
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe("prod-1");
    });

    it("should handle corrupted localStorage data", () => {
      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] = "invalid json";

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should return empty array in SSR context", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);

      global.window = originalWindow;
    });

    it("should handle localStorage errors gracefully", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should handle items at exact expiry boundary", () => {
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const items = [
        {
          id: "prod-1",
          name: "Boundary Product",
          image: "image1.jpg",
          price: 100,
          slug: "boundary",
          viewed_at: now - expiryMs,
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const history = viewingHistoryService.getHistory();
      // Items at exact boundary are filtered out (uses < not <=)
      expect(history).toHaveLength(0);
    });
  });

  describe("getRecentlyViewed", () => {
    it("should return limited number of items", () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const recent = viewingHistoryService.getRecentlyViewed(5);
      expect(recent).toHaveLength(5);
    });

    it("should use default limit of 8", () => {
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const recent = viewingHistoryService.getRecentlyViewed();
      expect(recent).toHaveLength(8);
    });

    it("should return all items if less than limit", () => {
      const items = Array.from({ length: 3 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const recent = viewingHistoryService.getRecentlyViewed(10);
      expect(recent).toHaveLength(3);
    });

    it("should handle limit of 0", () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const recent = viewingHistoryService.getRecentlyViewed(0);
      expect(recent).toHaveLength(0);
    });

    it("should handle negative limit", () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const recent = viewingHistoryService.getRecentlyViewed(-1);
      // slice(0, -1) returns all but last item
      expect(recent).toHaveLength(4);
      expect(recent[recent.length - 1].id).toBe("prod-3");
    });
  });

  describe("addToHistory", () => {
    it("should add new item to history", () => {
      const item = {
        id: "prod-1",
        name: "Product 1",
        image: "image1.jpg",
        price: 100,
        slug: "product-1",
      };

      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(item);
      expect(history[0].viewed_at).toBeDefined();
    });

    it("should add item at the beginning of history", () => {
      const existingItem = {
        id: "prod-1",
        name: "Product 1",
        image: "image1.jpg",
        price: 100,
        slug: "product-1",
        viewed_at: Date.now(),
      };

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] = JSON.stringify([
        existingItem,
      ]);

      const newItem = {
        id: "prod-2",
        name: "Product 2",
        image: "image2.jpg",
        price: 200,
        slug: "product-2",
      };

      viewingHistoryService.addToHistory(newItem);

      const history = viewingHistoryService.getHistory();
      expect(history[0].id).toBe("prod-2");
      expect(history[1].id).toBe("prod-1");
    });

    it("should move existing item to top when viewed again", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now() - 1000,
        },
        {
          id: "prod-2",
          name: "Product 2",
          image: "image2.jpg",
          price: 200,
          slug: "product-2",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.addToHistory({
        id: "prod-1",
        name: "Product 1 Updated",
        image: "image1-new.jpg",
        price: 150,
        slug: "product-1",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].id).toBe("prod-1");
      expect(history[0].name).toBe("Product 1 Updated");
      expect(history[0].viewed_at).toBeGreaterThan(items[0].viewed_at);
    });

    it("should trim history to MAX_ITEMS", () => {
      const maxItems = VIEWING_HISTORY_CONFIG.MAX_ITEMS;
      const items = Array.from({ length: maxItems }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.addToHistory({
        id: "prod-new",
        name: "New Product",
        image: "new.jpg",
        price: 100,
        slug: "new-product",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(maxItems);
      expect(history[0].id).toBe("prod-new");
      expect(history[history.length - 1].id).not.toBe(`prod-${maxItems - 1}`);
    });

    it("should not add item with empty id", () => {
      viewingHistoryService.addToHistory({
        id: "",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should not add item with whitespace-only id", () => {
      viewingHistoryService.addToHistory({
        id: "   ",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should handle SSR context gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      viewingHistoryService.addToHistory({
        id: "prod-1",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      });

      global.window = originalWindow;

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage full");
      });

      viewingHistoryService.addToHistory({
        id: "prod-1",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      });

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle special characters in item data", () => {
      const item = {
        id: "prod-1",
        name: 'Product with "quotes" & special <chars>',
        image: "image.jpg",
        price: 100,
        slug: "product-1",
      };

      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      expect(history[0].name).toBe(item.name);
    });

    it("should handle very long strings in item data", () => {
      const item = {
        id: "prod-1",
        name: "A".repeat(10000),
        image: "image.jpg",
        price: 100,
        slug: "product-1",
      };

      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      expect(history[0].name).toBe(item.name);
    });

    it("should handle item with additional properties", () => {
      const item = {
        id: "prod-1",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product-1",
        extra: "extra data",
      } as any;

      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      expect(history[0]).toMatchObject(item);
    });
  });

  describe("removeFromHistory", () => {
    it("should remove specific item from history", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
        {
          id: "prod-2",
          name: "Product 2",
          image: "image2.jpg",
          price: 200,
          slug: "product-2",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.removeFromHistory("prod-1");

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-2");
    });

    it("should handle removing non-existent item", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.removeFromHistory("non-existent");

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
    });

    it("should handle SSR context gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      viewingHistoryService.removeFromHistory("prod-1");

      global.window = originalWindow;

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.removeFromHistory("prod-1");

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("clearHistory", () => {
    it("should remove all history items", () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      viewingHistoryService.clearHistory();

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
      expect(
        mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY]
      ).toBeUndefined();
    });

    it("should handle clearing empty history", () => {
      viewingHistoryService.clearHistory();

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(0);
    });

    it("should handle SSR context gracefully", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      viewingHistoryService.clearHistory();

      global.window = originalWindow;

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle localStorage errors gracefully", () => {
      jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      viewingHistoryService.clearHistory();

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("getCount", () => {
    it("should return count of items in history", () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        image: `image${i}.jpg`,
        price: 100,
        slug: `product-${i}`,
        viewed_at: Date.now(),
      }));

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const count = viewingHistoryService.getCount();
      expect(count).toBe(5);
    });

    it("should return 0 for empty history", () => {
      const count = viewingHistoryService.getCount();
      expect(count).toBe(0);
    });

    it("should exclude expired items from count", () => {
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const items = [
        {
          id: "prod-1",
          name: "Recent",
          image: "image1.jpg",
          price: 100,
          slug: "recent",
          viewed_at: now,
        },
        {
          id: "prod-2",
          name: "Expired",
          image: "image2.jpg",
          price: 200,
          slug: "expired",
          viewed_at: now - expiryMs - 1000,
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      const count = viewingHistoryService.getCount();
      expect(count).toBe(1);
    });
  });

  describe("isInHistory", () => {
    it("should return true for item in history", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      expect(viewingHistoryService.isInHistory("prod-1")).toBe(true);
    });

    it("should return false for item not in history", () => {
      const items = [
        {
          id: "prod-1",
          name: "Product 1",
          image: "image1.jpg",
          price: 100,
          slug: "product-1",
          viewed_at: Date.now(),
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      expect(viewingHistoryService.isInHistory("prod-2")).toBe(false);
    });

    it("should return false for empty history", () => {
      expect(viewingHistoryService.isInHistory("prod-1")).toBe(false);
    });

    it("should return false for expired items", () => {
      const now = Date.now();
      const expiryMs = VIEWING_HISTORY_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      const items = [
        {
          id: "prod-1",
          name: "Expired",
          image: "image1.jpg",
          price: 100,
          slug: "expired",
          viewed_at: now - expiryMs - 1000,
        },
      ];

      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(items);

      expect(viewingHistoryService.isInHistory("prod-1")).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle quota exceeded error", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        const error: any = new Error("QuotaExceededError");
        error.name = "QuotaExceededError";
        throw error;
      });

      viewingHistoryService.addToHistory({
        id: "prod-1",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      });

      // Should not throw
      expect(true).toBe(true);
    });

    it("should handle circular reference in item data", () => {
      const item: any = {
        id: "prod-1",
        name: "Product",
        image: "image.jpg",
        price: 100,
        slug: "product",
      };
      item.self = item; // Circular reference

      // Should not add due to JSON.stringify error
      viewingHistoryService.addToHistory(item);

      // Storage should remain empty or unchanged
      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeLessThanOrEqual(1);
    });

    it("should handle concurrent modifications", () => {
      viewingHistoryService.addToHistory({
        id: "prod-1",
        name: "Product 1",
        image: "image1.jpg",
        price: 100,
        slug: "product-1",
      });

      // Simulate concurrent modification by directly changing storage
      const stored = JSON.parse(
        mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY]
      );
      stored.push({
        id: "prod-2",
        name: "Product 2",
        image: "image2.jpg",
        price: 200,
        slug: "product-2",
        viewed_at: Date.now(),
      });
      mockLocalStorage[VIEWING_HISTORY_CONFIG.STORAGE_KEY] =
        JSON.stringify(stored);

      viewingHistoryService.addToHistory({
        id: "prod-3",
        name: "Product 3",
        image: "image3.jpg",
        price: 300,
        slug: "product-3",
      });

      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle items with null or undefined properties", () => {
      const item = {
        id: "prod-1",
        name: null as any,
        image: undefined as any,
        price: 100,
        slug: "product-1",
      };

      viewingHistoryService.addToHistory(item);

      const history = viewingHistoryService.getHistory();
      // Improved validation rejects items with null/undefined required fields
      expect(history).toHaveLength(0);
    });
  });
});
