/**
 * Viewing History Service Unit Tests
 * Tests localStorage-based recently viewed products functionality
 */

import {
  VIEWING_HISTORY_CONFIG,
  type ViewingHistoryItem,
} from "@/constants/navigation";
import { viewingHistoryService } from "@/services/viewing-history.service";

describe("ViewingHistoryService", () => {
  const mockItem: Omit<ViewingHistoryItem, "viewed_at"> = {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    price: 1000,
    image: "/test.jpg",
    shopName: "Test Shop",
    inStock: true,
  };

  const mockItem2: Omit<ViewingHistoryItem, "viewed_at"> = {
    id: "prod-2",
    name: "Test Product 2",
    slug: "test-product-2",
    price: 2000,
    image: "/test2.jpg",
    shopName: "Test Shop 2",
    inStock: true,
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("getHistory", () => {
    it("should return empty array when no history", () => {
      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should return history from localStorage", () => {
      const historyItem: ViewingHistoryItem = {
        ...mockItem,
        viewed_at: Date.now(),
      };
      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify([historyItem])
      );

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-1");
    });

    it("should filter out expired items", () => {
      const expiredDate =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000;
      const recentDate = Date.now();

      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "expired", viewed_at: expiredDate },
        { ...mockItem2, viewed_at: recentDate },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-2");
    });

    it("should update storage after filtering expired items", () => {
      const expiredDate =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000;

      const items: ViewingHistoryItem[] = [
        { ...mockItem, viewed_at: expiredDate },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      viewingHistoryService.getHistory();

      const stored = localStorage.getItem(VIEWING_HISTORY_CONFIG.STORAGE_KEY);
      expect(JSON.parse(stored!)).toEqual([]);
    });

    it("should handle JSON parse errors gracefully", () => {
      localStorage.setItem(VIEWING_HISTORY_CONFIG.STORAGE_KEY, "invalid-json");

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error("Storage error");
      });

      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe("getRecentlyViewed", () => {
    it("should return limited number of items", () => {
      const items: ViewingHistoryItem[] = Array.from(
        { length: 10 },
        (_, i) => ({
          ...mockItem,
          id: `prod-${i}`,
          viewed_at: Date.now() - i * 1000,
        })
      );

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      const recent = viewingHistoryService.getRecentlyViewed(5);
      expect(recent).toHaveLength(5);
      expect(recent[0].id).toBe("prod-0");
    });

    it("should use default limit of 8", () => {
      const items: ViewingHistoryItem[] = Array.from(
        { length: 15 },
        (_, i) => ({
          ...mockItem,
          id: `prod-${i}`,
          viewed_at: Date.now() - i * 1000,
        })
      );

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      const recent = viewingHistoryService.getRecentlyViewed();
      expect(recent).toHaveLength(8);
    });

    it("should return all items if less than limit", () => {
      const items: ViewingHistoryItem[] = [
        { ...mockItem, viewed_at: Date.now() },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      const recent = viewingHistoryService.getRecentlyViewed(10);
      expect(recent).toHaveLength(1);
    });
  });

  describe("addToHistory", () => {
    it("should add item to empty history", () => {
      viewingHistoryService.addToHistory(mockItem);

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-1");
      expect(history[0].viewed_at).toBeDefined();
    });

    it("should add item to beginning of history", () => {
      viewingHistoryService.addToHistory(mockItem);
      viewingHistoryService.addToHistory(mockItem2);

      const history = viewingHistoryService.getHistory();
      expect(history[0].id).toBe("prod-2");
      expect(history[1].id).toBe("prod-1");
    });

    it("should move existing item to top with updated timestamp", () => {
      viewingHistoryService.addToHistory(mockItem);
      const firstTimestamp = viewingHistoryService.getHistory()[0].viewed_at;

      // Wait a bit to ensure different timestamp
      jest.advanceTimersByTime(100);

      viewingHistoryService.addToHistory(mockItem);
      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].viewed_at).toBeGreaterThanOrEqual(firstTimestamp);
    });

    it("should trim history to max items", () => {
      // Add more than max items
      for (let i = 0; i < VIEWING_HISTORY_CONFIG.MAX_ITEMS + 5; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `prod-${i}`,
        });
      }

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(VIEWING_HISTORY_CONFIG.MAX_ITEMS);
      // Most recent should be kept
      expect(history[0].id).toBe(
        `prod-${VIEWING_HISTORY_CONFIG.MAX_ITEMS + 4}`
      );
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      expect(() => viewingHistoryService.addToHistory(mockItem)).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });

    it("should preserve all item properties", () => {
      const itemWithAllProps: Omit<ViewingHistoryItem, "viewed_at"> = {
        id: "test-id",
        name: "Test Name",
        slug: "test-slug",
        price: 999,
        image: "/test-image.jpg",
        shopName: "Test Shop",
        inStock: false,
      };

      viewingHistoryService.addToHistory(itemWithAllProps);
      const history = viewingHistoryService.getHistory();

      expect(history[0]).toMatchObject(itemWithAllProps);
    });
  });

  describe("removeFromHistory", () => {
    it("should remove item from history", () => {
      viewingHistoryService.addToHistory(mockItem);
      viewingHistoryService.addToHistory(mockItem2);

      viewingHistoryService.removeFromHistory("prod-1");
      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod-2");
    });

    it("should handle removing non-existent item", () => {
      viewingHistoryService.addToHistory(mockItem);
      viewingHistoryService.removeFromHistory("non-existent");

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
    });

    it("should handle empty history", () => {
      viewingHistoryService.removeFromHistory("prod-1");
      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error("Storage error");
      });

      expect(() =>
        viewingHistoryService.removeFromHistory("prod-1")
      ).not.toThrow();

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe("clearHistory", () => {
    it("should clear all history", () => {
      viewingHistoryService.addToHistory(mockItem);
      viewingHistoryService.addToHistory(mockItem2);

      viewingHistoryService.clearHistory();
      const history = viewingHistoryService.getHistory();

      expect(history).toEqual([]);
    });

    it("should handle already empty history", () => {
      viewingHistoryService.clearHistory();
      const history = viewingHistoryService.getHistory();
      expect(history).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error("Storage error");
      });

      expect(() => viewingHistoryService.clearHistory()).not.toThrow();

      Storage.prototype.removeItem = originalRemoveItem;
    });
  });

  describe("getCount", () => {
    it("should return 0 for empty history", () => {
      expect(viewingHistoryService.getCount()).toBe(0);
    });

    it("should return correct count", () => {
      viewingHistoryService.addToHistory(mockItem);
      expect(viewingHistoryService.getCount()).toBe(1);

      viewingHistoryService.addToHistory(mockItem2);
      expect(viewingHistoryService.getCount()).toBe(2);
    });

    it("should not count expired items", () => {
      const expiredDate =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000;

      const items: ViewingHistoryItem[] = [
        { ...mockItem, viewed_at: expiredDate },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      expect(viewingHistoryService.getCount()).toBe(0);
    });
  });

  describe("isInHistory", () => {
    it("should return true for item in history", () => {
      viewingHistoryService.addToHistory(mockItem);
      expect(viewingHistoryService.isInHistory("prod-1")).toBe(true);
    });

    it("should return false for item not in history", () => {
      expect(viewingHistoryService.isInHistory("prod-1")).toBe(false);
    });

    it("should return false for expired item", () => {
      const expiredDate =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000;

      const items: ViewingHistoryItem[] = [
        { ...mockItem, viewed_at: expiredDate },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      expect(viewingHistoryService.isInHistory("prod-1")).toBe(false);
    });
  });

  describe("Edge Cases and Performance", () => {
    it("should handle rapid consecutive adds", () => {
      for (let i = 0; i < 100; i++) {
        viewingHistoryService.addToHistory({
          ...mockItem,
          id: `prod-${i}`,
        });
      }

      const history = viewingHistoryService.getHistory();
      expect(history.length).toBeLessThanOrEqual(
        VIEWING_HISTORY_CONFIG.MAX_ITEMS
      );
    });

    it("should maintain chronological order", () => {
      const items = ["prod-1", "prod-2", "prod-3"];

      items.forEach((id) => {
        viewingHistoryService.addToHistory({ ...mockItem, id });
      });

      const history = viewingHistoryService.getHistory();
      expect(history[0].id).toBe("prod-3");
      expect(history[1].id).toBe("prod-2");
      expect(history[2].id).toBe("prod-1");
    });

    it("should handle items at expiry boundary", () => {
      const almostExpired =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS - 1) * 24 * 60 * 60 * 1000;
      const justExpired =
        Date.now() -
        (VIEWING_HISTORY_CONFIG.EXPIRY_DAYS + 1) * 24 * 60 * 60 * 1000;

      const items: ViewingHistoryItem[] = [
        { ...mockItem, id: "almost", viewed_at: almostExpired },
        { ...mockItem, id: "expired", viewed_at: justExpired },
      ];

      localStorage.setItem(
        VIEWING_HISTORY_CONFIG.STORAGE_KEY,
        JSON.stringify(items)
      );

      const history = viewingHistoryService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("almost");
    });

    it("should handle items with missing optional fields", () => {
      const minimalItem: Omit<ViewingHistoryItem, "viewed_at"> = {
        id: "minimal",
        name: "Minimal",
        slug: "minimal",
        price: 0,
        image: "",
        shopName: "",
        inStock: false,
      };

      viewingHistoryService.addToHistory(minimalItem);
      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(minimalItem);
    });
  });
});
