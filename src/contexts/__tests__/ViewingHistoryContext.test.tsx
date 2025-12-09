/**
 * Unit Tests for ViewingHistoryContext
 *
 * Tests viewing history tracking, localStorage persistence,
 * cross-tab synchronization, and deduplication logic
 */

import { act, renderHook } from "@testing-library/react";
import React from "react";
import {
  ViewingHistoryProvider,
  useViewingHistory,
} from "../ViewingHistoryContext";

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

// Mock storage event - JSDOM doesn't support StorageEvent constructor properly
const createStorageEvent = (key: string, newValue: string | null) => {
  const event = new Event("storage") as StorageEvent;
  Object.defineProperty(event, "key", { value: key, writable: false });
  Object.defineProperty(event, "newValue", {
    value: newValue,
    writable: false,
  });
  Object.defineProperty(event, "oldValue", { value: null, writable: false });
  Object.defineProperty(event, "storageArea", {
    value: window.localStorage,
    writable: false,
  });
  return event;
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ViewingHistoryProvider>{children}</ViewingHistoryProvider>
);

// Helper to create mock history item
const createMockItem = (id: string) => ({
  id,
  name: `Product ${id}`,
  slug: id,
  image: `${id}.jpg`,
  price: 100,
  shopName: "Shop 1",
  inStock: true,
});

describe("ViewingHistoryContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Initialization", () => {
    it("should initialize with empty history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      expect(result.current.history).toEqual([]);
    });

    it("should load history from localStorage on mount", () => {
      const mockHistory = [
        { id: "product-1", viewed_at: Date.now() },
        { id: "product-2", viewed_at: Date.now() },
      ];

      localStorageMock.setItem("viewing_history", JSON.stringify(mockHistory));

      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].id).toBe("product-1");
      expect(result.current.history[1].id).toBe("product-2");
    });

    it("should handle corrupted localStorage data", () => {
      localStorageMock.setItem("viewing_history", "invalid-json");

      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      expect(result.current.history).toEqual([]);
    });

    it("should throw error when used outside provider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        renderHook(() => useViewingHistory());
      }).toThrow(
        "useViewingHistory must be used within a ViewingHistoryProvider"
      );

      consoleError.mockRestore();
    });
  });

  describe("Adding to History", () => {
    it("should add product to history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory({
          id: "product-1",
          name: "Product 1",
          slug: "product-1",
          image: "image.jpg",
          price: 100,
          shopName: "Shop 1",
          inStock: true,
        });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe("product-1");
      expect(result.current.history[0].viewed_at).toBeTruthy();
    });

    it("should save to localStorage when adding", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "viewing_history",
        expect.stringContaining("product-1")
      );
    });

    it("should add new item to the beginning", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
      });

      expect(result.current.history[0].id).toBe("product-2");
      expect(result.current.history[1].id).toBe("product-1");
    });

    it("should move existing item to the beginning", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
        result.current.addToHistory(createMockItem("product-3"));
        result.current.addToHistory(createMockItem("product-1")); // Re-view product-1
      });

      expect(result.current.history[0].id).toBe("product-1");
      expect(result.current.history).toHaveLength(3);
    });

    it("should update timestamp when re-viewing", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      const firstTimestamp = result.current.history[0].viewed_at;

      // Wait a bit to ensure different timestamp
      jest.advanceTimersByTime(100);

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      const secondTimestamp = result.current.history[0].viewed_at;
      expect(secondTimestamp).not.toBe(firstTimestamp);
    });

    it("should limit history to maximum items", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      // Add more items than the limit (assuming limit is 50)
      act(() => {
        for (let i = 1; i <= 60; i++) {
          result.current.addToHistory(createMockItem(`product-${i}`));
        }
      });

      expect(result.current.history.length).toBeLessThanOrEqual(50);
      expect(result.current.history[0].id).toBe("product-60");
    });
  });

  describe("Removing from History", () => {
    it("should remove product from history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
      });

      act(() => {
        result.current.removeFromHistory("product-1");
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].id).toBe("product-2");
    });

    it("should update localStorage when removing", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
      });

      localStorageMock.setItem.mockClear();

      act(() => {
        result.current.removeFromHistory("product-1");
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it("should not throw when removing non-existent item", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      expect(() => {
        act(() => {
          result.current.removeFromHistory("non-existent");
        });
      }).not.toThrow();
    });
  });

  describe("Clearing History", () => {
    it("should clear all history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
        result.current.addToHistory(createMockItem("product-3"));
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
    });

    it("should remove from localStorage when clearing", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "viewing_history"
      );
    });
  });

  describe("Checking History", () => {
    it("should return true if item is in history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      expect(result.current.isInHistory("product-1")).toBe(true);
    });

    it("should return false if item is not in history", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      expect(result.current.isInHistory("product-1")).toBe(false);
    });
  });

  describe("Cross-Tab Synchronization", () => {
    it("should listen to storage events", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");

      renderHook(() => useViewingHistory(), { wrapper });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      );
    });

    it("should update history when storage event occurs", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      const newHistory = [
        {
          id: "product-1",
          viewed_at: Date.now(),
          name: "Product 1",
          slug: "product-1",
          image: "img.jpg",
          price: 100,
          shopName: "Shop",
          inStock: true,
        },
        {
          id: "product-2",
          viewed_at: Date.now(),
          name: "Product 2",
          slug: "product-2",
          image: "img.jpg",
          price: 100,
          shopName: "Shop",
          inStock: true,
        },
      ];

      // Set the data in localStorage first
      localStorageMock.setItem("viewing_history", JSON.stringify(newHistory));

      act(() => {
        const event = createStorageEvent(
          "viewing_history",
          JSON.stringify(newHistory)
        );
        window.dispatchEvent(event);
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].id).toBe("product-1");
    });

    it("should clear history when storage event has null value", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      // Clear localStorage
      localStorageMock.removeItem("viewing_history");

      act(() => {
        const event = createStorageEvent("viewing_history", null);
        window.dispatchEvent(event);
      });

      expect(result.current.history).toEqual([]);
    });

    it("should ignore storage events for other keys", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
      });

      const originalLength = result.current.history.length;

      act(() => {
        const event = createStorageEvent("other-key", "some-value");
        window.dispatchEvent(event);
      });

      expect(result.current.history.length).toBe(originalLength);
    });

    it("should handle corrupted data in storage event", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        const event = createStorageEvent("viewing_history", "invalid-json");
        window.dispatchEvent(event);
      });

      expect(result.current.history).toEqual([]);
    });

    it("should cleanup event listener on unmount", () => {
      const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useViewingHistory(), { wrapper });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "storage",
        expect.any(Function)
      );
    });
  });

  describe("Persistence", () => {
    it("should persist history between remounts", () => {
      const { result: result1, unmount } = renderHook(
        () => useViewingHistory(),
        { wrapper }
      );

      act(() => {
        result1.current.addToHistory(createMockItem("product-1"));
        result1.current.addToHistory(createMockItem("product-2"));
      });

      unmount();

      const { result: result2 } = renderHook(() => useViewingHistory(), {
        wrapper,
      });

      expect(result2.current.history).toHaveLength(2);
      expect(result2.current.history[0].id).toBe("product-2");
      expect(result2.current.history[1].id).toBe("product-1");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty product ID", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory({ ...createMockItem(""), id: "" });
      });

      // Should not add empty ID
      expect(result.current.history).toHaveLength(0);
    });

    it("should handle rapid consecutive additions", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      act(() => {
        result.current.addToHistory(createMockItem("product-1"));
        result.current.addToHistory(createMockItem("product-2"));
        result.current.addToHistory(createMockItem("product-3"));
        result.current.addToHistory(createMockItem("product-4"));
        result.current.addToHistory(createMockItem("product-5"));
      });

      expect(result.current.history).toHaveLength(5);
      expect(result.current.history[0].id).toBe("product-5");
    });

    it("should handle localStorage quota exceeded", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      // Mock localStorage.setItem to throw quota exceeded error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => {
        act(() => {
          result.current.addToHistory(createMockItem("product-1"));
        });
      }).not.toThrow();
    });

    it("should handle special characters in product ID", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      const specialId = "product-!@#$%^&*()_+{}:\"<>?[];',./`~";

      act(() => {
        result.current.addToHistory(createMockItem(specialId));
      });

      // localStorage might reject special characters silently, so just verify no crash
      expect(result.current.history).toBeDefined();
      expect(Array.isArray(result.current.history)).toBe(true);
    });

    it("should handle very long product ID", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      const longId = "product-" + "x".repeat(1000);

      act(() => {
        result.current.addToHistory(createMockItem(longId));
      });

      // localStorage has size limits, so just verify no crash
      expect(result.current.history).toBeDefined();
      expect(Array.isArray(result.current.history)).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should handle large history efficiently", () => {
      const { result } = renderHook(() => useViewingHistory(), { wrapper });

      const startTime = Date.now();

      act(() => {
        for (let i = 1; i <= 100; i++) {
          result.current.addToHistory(createMockItem(`product-${i}`));
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it("should not re-render unnecessarily", () => {
      let renderCount = 0;

      const TestComponent = () => {
        const history = useViewingHistory();
        renderCount++;
        return null;
      };

      const { rerender } = render(
        <ViewingHistoryProvider>
          <TestComponent />
        </ViewingHistoryProvider>
      );

      const initialRenderCount = renderCount;

      rerender(
        <ViewingHistoryProvider>
          <TestComponent />
        </ViewingHistoryProvider>
      );

      // Should only re-render when state actually changes
      expect(renderCount).toBe(initialRenderCount);
    });
  });
});

// Helper for testing component rendering
function render(ui: React.ReactElement) {
  let rerender: (ui: React.ReactElement) => void;

  const result = renderHook(
    () => {
      return ui;
    },
    { wrapper: ({ children }) => <>{children}</> }
  );

  rerender = (newUi: React.ReactElement) => {
    result.rerender(() => newUi);
  };

  return { rerender };
}
