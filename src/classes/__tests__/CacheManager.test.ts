/**
 * @jest-environment jsdom
 */

import { CacheManager } from "../CacheManager";

describe("CacheManager", () => {
  let cache: CacheManager;

  beforeEach(() => {
    // Reset singleton instance before each test
    (CacheManager as any).instance = undefined;
    cache = CacheManager.getInstance();
  });

  afterEach(() => {
    cache.clear();
  });

  describe("Singleton Pattern", () => {
    it("should return same instance", () => {
      const cache1 = CacheManager.getInstance();
      const cache2 = CacheManager.getInstance();
      expect(cache1).toBe(cache2);
    });

    it("should initialize with default max size", () => {
      expect(cache.size()).toBe(0);
    });

    it("should accept custom max size on first initialization", () => {
      (CacheManager as any).instance = undefined;
      const customCache = CacheManager.getInstance(50);
      expect(customCache).toBeInstanceOf(CacheManager);
    });
  });

  describe("set()", () => {
    it("should store value in cache", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should store objects in cache", () => {
      const obj = { name: "test", count: 42 };
      cache.set("obj", obj);
      expect(cache.get("obj")).toEqual(obj);
    });

    it("should store arrays in cache", () => {
      const arr = [1, 2, 3, 4, 5];
      cache.set("arr", arr);
      expect(cache.get("arr")).toEqual(arr);
    });

    it("should overwrite existing key", () => {
      cache.set("key1", "value1");
      cache.set("key1", "value2");
      expect(cache.get("key1")).toBe("value2");
    });

    it("should store value with TTL", () => {
      cache.set("key1", "value1", { ttl: 1000 });
      expect(cache.get("key1")).toBe("value1");
    });

    it("should respect max size limit", () => {
      (CacheManager as any).instance = undefined;
      const smallCache = CacheManager.getInstance(3);

      smallCache.set("key1", "value1");
      smallCache.set("key2", "value2");
      smallCache.set("key3", "value3");
      smallCache.set("key4", "value4"); // Should evict key1

      expect(smallCache.has("key1")).toBe(false);
      expect(smallCache.has("key4")).toBe(true);
      expect(smallCache.size()).toBe(3);
    });

    it("should not increase size when overwriting", () => {
      cache.set("key1", "value1");
      const sizeBefore = cache.size();
      cache.set("key1", "value2");
      expect(cache.size()).toBe(sizeBefore);
    });
  });

  describe("get()", () => {
    it("should return stored value", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for non-existent key", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("should return null for expired entry", () => {
      jest.useFakeTimers();
      cache.set("key1", "value1", { ttl: 1000 });

      jest.advanceTimersByTime(1001);
      expect(cache.get("key1")).toBeNull();

      jest.useRealTimers();
    });

    it("should return value before expiration", () => {
      jest.useFakeTimers();
      cache.set("key1", "value1", { ttl: 1000 });

      jest.advanceTimersByTime(500);
      expect(cache.get("key1")).toBe("value1");

      jest.useRealTimers();
    });

    it("should auto-delete expired entry", () => {
      jest.useFakeTimers();
      cache.set("key1", "value1", { ttl: 1000 });
      const sizeBefore = cache.size();

      jest.advanceTimersByTime(1001);
      cache.get("key1");

      expect(cache.size()).toBe(sizeBefore - 1);
      jest.useRealTimers();
    });

    it("should preserve type information", () => {
      const obj = { name: "test" };
      cache.set("obj", obj);
      const result = cache.get<{ name: string }>("obj");
      expect(result?.name).toBe("test");
    });
  });

  describe("has()", () => {
    it("should return true for existing key", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      expect(cache.has("nonexistent")).toBe(false);
    });

    it("should return false for expired entry", () => {
      jest.useFakeTimers();
      cache.set("key1", "value1", { ttl: 1000 });

      jest.advanceTimersByTime(1001);
      expect(cache.has("key1")).toBe(false);

      jest.useRealTimers();
    });

    it("should return true for non-expired entry", () => {
      jest.useFakeTimers();
      cache.set("key1", "value1", { ttl: 1000 });

      jest.advanceTimersByTime(500);
      expect(cache.has("key1")).toBe(true);

      jest.useRealTimers();
    });
  });

  describe("delete()", () => {
    it("should delete existing entry", () => {
      cache.set("key1", "value1");
      const result = cache.delete("key1");

      expect(result).toBe(true);
      expect(cache.has("key1")).toBe(false);
    });

    it("should return false for non-existent key", () => {
      const result = cache.delete("nonexistent");
      expect(result).toBe(false);
    });

    it("should decrease cache size", () => {
      cache.set("key1", "value1");
      const sizeBefore = cache.size();
      cache.delete("key1");

      expect(cache.size()).toBe(sizeBefore - 1);
    });
  });

  describe("clear()", () => {
    it("should clear all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(false);
    });

    it("should work on empty cache", () => {
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("size()", () => {
    it("should return 0 for empty cache", () => {
      expect(cache.size()).toBe(0);
    });

    it("should return correct size", () => {
      cache.set("key1", "value1");
      expect(cache.size()).toBe(1);

      cache.set("key2", "value2");
      expect(cache.size()).toBe(2);
    });

    it("should update after delete", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.delete("key1");

      expect(cache.size()).toBe(1);
    });
  });

  describe("keys()", () => {
    it("should return empty array for empty cache", () => {
      expect(cache.keys()).toEqual([]);
    });

    it("should return all keys", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      const keys = cache.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys).toContain("key3");
    });

    it("should update after operations", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.delete("key1");

      const keys = cache.keys();
      expect(keys).toEqual(["key2"]);
    });
  });

  describe("cleanExpired()", () => {
    it("should remove expired entries", () => {
      jest.useFakeTimers();

      cache.set("key1", "value1", { ttl: 1000 });
      cache.set("key2", "value2", { ttl: 2000 });
      cache.set("key3", "value3"); // No TTL

      jest.advanceTimersByTime(1500);
      const cleaned = cache.cleanExpired();

      expect(cleaned).toBe(1);
      expect(cache.has("key1")).toBe(false);
      expect(cache.has("key2")).toBe(true);
      expect(cache.has("key3")).toBe(true);

      jest.useRealTimers();
    });

    it("should return 0 when no entries expired", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      const cleaned = cache.cleanExpired();
      expect(cleaned).toBe(0);
    });

    it("should handle empty cache", () => {
      const cleaned = cache.cleanExpired();
      expect(cleaned).toBe(0);
    });

    it("should clean all expired entries", () => {
      jest.useFakeTimers();

      cache.set("key1", "value1", { ttl: 500 });
      cache.set("key2", "value2", { ttl: 500 });
      cache.set("key3", "value3", { ttl: 500 });

      jest.advanceTimersByTime(501);
      const cleaned = cache.cleanExpired();

      expect(cleaned).toBe(3);
      expect(cache.size()).toBe(0);

      jest.useRealTimers();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null values", () => {
      cache.set("null", null);
      expect(cache.get("null")).toBeNull();
    });

    it("should handle undefined values", () => {
      cache.set("undef", undefined);
      expect(cache.get("undef")).toBeUndefined();
    });

    it("should handle boolean values", () => {
      cache.set("true", true);
      cache.set("false", false);
      expect(cache.get("true")).toBe(true);
      expect(cache.get("false")).toBe(false);
    });

    it("should handle numeric values", () => {
      cache.set("zero", 0);
      cache.set("negative", -42);
      expect(cache.get("zero")).toBe(0);
      expect(cache.get("negative")).toBe(-42);
    });

    it("should handle nested objects", () => {
      const nested = {
        level1: {
          level2: {
            level3: "deep value",
          },
        },
      };
      cache.set("nested", nested);
      expect(cache.get("nested")).toEqual(nested);
    });

    it("should handle special characters in keys", () => {
      cache.set("key-with-dash", "value1");
      cache.set("key.with.dots", "value2");
      cache.set("key:with:colons", "value3");

      expect(cache.get("key-with-dash")).toBe("value1");
      expect(cache.get("key.with.dots")).toBe("value2");
      expect(cache.get("key:with:colons")).toBe("value3");
    });
  });
});
