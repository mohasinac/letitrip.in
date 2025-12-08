import type { ViewingHistoryItem } from "@/constants/navigation";
import { viewingHistoryService } from "../viewing-history.service";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("ViewingHistoryService", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("getHistory", () => {
    it("should return empty array when no history exists", () => {
      const result = viewingHistoryService.getHistory();

      expect(result).toEqual([]);
    });

    it("should return all history items", () => {
      const mockHistory: ViewingHistoryItem[] = [
        {
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
          viewed_at: Date.now(),
        },
        {
          id: "prod2",
          type: "product",
          name: "Product 2",
          slug: "product-2",
          image: "image2.jpg",
          price: 200,
          viewed_at: Date.now(),
        },
      ];

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const result = viewingHistoryService.getHistory();

      expect(result).toEqual(mockHistory);
    });

    it("should filter out expired items", () => {
      const now = Date.now();
      const expiredTime = now - 31 * 24 * 60 * 60 * 1000; // 31 days ago

      const mockHistory: ViewingHistoryItem[] = [
        {
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
          viewed_at: now,
        },
        {
          id: "prod2",
          type: "product",
          name: "Product 2",
          slug: "product-2",
          image: "image2.jpg",
          price: 200,
          viewed_at: expiredTime,
        },
      ];

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const result = viewingHistoryService.getHistory();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("prod1");
    });

    it("should update storage after filtering expired items", () => {
      const now = Date.now();
      const expiredTime = now - 31 * 24 * 60 * 60 * 1000;

      const mockHistory: ViewingHistoryItem[] = [
        {
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
          viewed_at: now,
        },
        {
          id: "prod2",
          type: "product",
          name: "Product 2",
          slug: "product-2",
          image: "image2.jpg",
          price: 200,
          viewed_at: expiredTime,
        },
      ];

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      viewingHistoryService.getHistory();

      const stored = JSON.parse(
        localStorageMock.getItem("viewing_history") || "[]"
      );
      expect(stored).toHaveLength(1);
    });

    it("should return empty array when localStorage has invalid JSON", () => {
      localStorageMock.setItem("viewing_history", "invalid json");

      const result = viewingHistoryService.getHistory();

      expect(result).toEqual([]);
    });

    it("should handle missing localStorage gracefully", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = viewingHistoryService.getHistory();

      expect(result).toEqual([]);

      (global as any).window = originalWindow;
    });
  });

  describe("getRecentlyViewed", () => {
    it("should return limited number of items", () => {
      const mockHistory: ViewingHistoryItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `prod${i}`,
          type: "product" as const,
          name: `Product ${i}`,
          slug: `product-${i}`,
          image: `image${i}.jpg`,
          price: 100 * i,
          viewed_at: Date.now() - i * 1000,
        })
      );

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const result = viewingHistoryService.getRecentlyViewed(8);

      expect(result).toHaveLength(8);
    });

    it("should use default limit of 8", () => {
      const mockHistory: ViewingHistoryItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          id: `prod${i}`,
          type: "product" as const,
          name: `Product ${i}`,
          slug: `product-${i}`,
          image: `image${i}.jpg`,
          price: 100,
          viewed_at: Date.now(),
        })
      );

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const result = viewingHistoryService.getRecentlyViewed();

      expect(result).toHaveLength(8);
    });

    it("should return all items if fewer than limit", () => {
      const mockHistory: ViewingHistoryItem[] = [
        {
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
          viewed_at: Date.now(),
        },
      ];

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const result = viewingHistoryService.getRecentlyViewed(8);

      expect(result).toHaveLength(1);
    });
  });

  describe("addToHistory", () => {
    it("should add new item to history", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod1");
      expect(history[0].viewed_at).toBeDefined();
    });

    it("should move existing item to top", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.addToHistory({
        id: "prod2",
        type: "product",
        name: "Product 2",
        slug: "product-2",
        image: "image2.jpg",
        price: 200,
      });

      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1 Updated",
        slug: "product-1",
        image: "image1-new.jpg",
        price: 150,
      });

      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].id).toBe("prod1");
      expect(history[0].name).toBe("Product 1 Updated");
      expect(history[1].id).toBe("prod2");
    });

    it("should trim history to max items", () => {
      // Add more than MAX_ITEMS (assuming 100)
      for (let i = 0; i < 110; i++) {
        viewingHistoryService.addToHistory({
          id: `prod${i}`,
          type: "product",
          name: `Product ${i}`,
          slug: `product-${i}`,
          image: `image${i}.jpg`,
          price: 100,
        });
      }

      const history = viewingHistoryService.getHistory();

      expect(history.length).toBeLessThanOrEqual(100);
      expect(history[0].id).toBe("prod109"); // Most recent
    });

    it("should handle localStorage errors gracefully", () => {
      const setItemSpy = jest
        .spyOn(localStorageMock, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage full");
        });

      expect(() => {
        viewingHistoryService.addToHistory({
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
        });
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it("should do nothing in SSR (no window)", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        viewingHistoryService.addToHistory({
          id: "prod1",
          type: "product",
          name: "Product 1",
          slug: "product-1",
          image: "image1.jpg",
          price: 100,
        });
      }).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("removeFromHistory", () => {
    it("should remove item from history", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.addToHistory({
        id: "prod2",
        type: "product",
        name: "Product 2",
        slug: "product-2",
        image: "image2.jpg",
        price: 200,
      });

      viewingHistoryService.removeFromHistory("prod1");

      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
      expect(history[0].id).toBe("prod2");
    });

    it("should do nothing if item not found", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.removeFromHistory("prod2");

      const history = viewingHistoryService.getHistory();

      expect(history).toHaveLength(1);
    });

    it("should handle localStorage errors gracefully", () => {
      const setItemSpy = jest
        .spyOn(localStorageMock, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage error");
        });

      expect(() => {
        viewingHistoryService.removeFromHistory("prod1");
      }).not.toThrow();

      setItemSpy.mockRestore();
    });

    it("should do nothing in SSR", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        viewingHistoryService.removeFromHistory("prod1");
      }).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("clearHistory", () => {
    it("should clear all history", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.clearHistory();

      const history = viewingHistoryService.getHistory();

      expect(history).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const removeItemSpy = jest
        .spyOn(localStorageMock, "removeItem")
        .mockImplementation(() => {
          throw new Error("Storage error");
        });

      expect(() => {
        viewingHistoryService.clearHistory();
      }).not.toThrow();

      removeItemSpy.mockRestore();
    });

    it("should do nothing in SSR", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        viewingHistoryService.clearHistory();
      }).not.toThrow();

      (global as any).window = originalWindow;
    });
  });

  describe("getCount", () => {
    it("should return 0 when history is empty", () => {
      const count = viewingHistoryService.getCount();

      expect(count).toBe(0);
    });

    it("should return correct count", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.addToHistory({
        id: "prod2",
        type: "product",
        name: "Product 2",
        slug: "product-2",
        image: "image2.jpg",
        price: 200,
      });

      const count = viewingHistoryService.getCount();

      expect(count).toBe(2);
    });
  });

  describe("isInHistory", () => {
    it("should return false when item not in history", () => {
      const result = viewingHistoryService.isInHistory("prod1");

      expect(result).toBe(false);
    });

    it("should return true when item in history", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      const result = viewingHistoryService.isInHistory("prod1");

      expect(result).toBe(true);
    });

    it("should return false after item is removed", () => {
      viewingHistoryService.addToHistory({
        id: "prod1",
        type: "product",
        name: "Product 1",
        slug: "product-1",
        image: "image1.jpg",
        price: 100,
      });

      viewingHistoryService.removeFromHistory("prod1");

      const result = viewingHistoryService.isInHistory("prod1");

      expect(result).toBe(false);
    });
  });
});
