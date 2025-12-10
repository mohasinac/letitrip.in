/**
 * Unit Tests for Memory Cache
 * Tests in-memory caching functionality
 */

import { MemoryCache } from "../memory-cache";

describe("MemoryCache", () => {
  let cache: MemoryCache;

  beforeEach(() => {
    cache = new MemoryCache(10);
  });

  afterEach(() => {
    cache.clear();
  });

  describe("Basic Operations", () => {
    it("should set and get a value", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for non-existent key", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("should overwrite existing key", () => {
      cache.set("key1", "value1");
      cache.set("key1", "value2");
      expect(cache.get("key1")).toBe("value2");
    });

    it("should handle different data types", () => {
      cache.set("string", "text");
      cache.set("number", 42);
      cache.set("boolean", true);
      cache.set("object", { name: "test" });
      cache.set("array", [1, 2, 3]);
      cache.set("null", null);

      expect(cache.get("string")).toBe("text");
      expect(cache.get("number")).toBe(42);
      expect(cache.get("boolean")).toBe(true);
      expect(cache.get("object")).toEqual({ name: "test" });
      expect(cache.get("array")).toEqual([1, 2, 3]);
      expect(cache.get("null")).toBeNull();
    });

    it("should handle nested objects", () => {
      const complexData = {
        user: {
          id: 1,
          profile: {
            name: "John",
            address: {
              city: "Mumbai",
              pincode: "400001",
            },
          },
        },
        items: [{ id: 1 }, { id: 2 }],
      };

      cache.set("complex", complexData);
      expect(cache.get("complex")).toEqual(complexData);
    });

    it("should handle undefined value", () => {
      cache.set("undef", undefined);
      expect(cache.get("undef")).toBeUndefined();
    });

    it("should handle empty string key", () => {
      cache.set("", "empty key");
      expect(cache.get("")).toBe("empty key");
    });

    it("should handle special characters in keys", () => {
      cache.set("key:with:colons", "value1");
      cache.set("key/with/slashes", "value2");
      cache.set("key@with@symbols", "value3");

      expect(cache.get("key:with:colons")).toBe("value1");
      expect(cache.get("key/with/slashes")).toBe("value2");
      expect(cache.get("key@with@symbols")).toBe("value3");
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should respect default TTL", async () => {
      cache.set("key1", "value1", 0.05); // 50ms
      expect(cache.get("key1")).toBe("value1");

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(cache.get("key1")).toBeNull();
    });

    it("should handle custom TTL", async () => {
      cache.set("shortLived", "value", 0.03); // 30ms
      cache.set("longLived", "value", 0.1); // 100ms

      await new Promise((resolve) => setTimeout(resolve, 40));

      expect(cache.get("shortLived")).toBeNull();
      expect(cache.get("longLived")).toBe("value");
    });

    it("should auto-delete expired entries on get", async () => {
      cache.set("key1", "value1", 0.05);

      await new Promise((resolve) => setTimeout(resolve, 60));

      const result = cache.get("key1");
      expect(result).toBeNull();

      // Verify entry was deleted
      const stats = cache.stats();
      expect(stats.size).toBe(0);
    });

    it("should handle very short TTL", async () => {
      cache.set("key1", "value1", 0.01); // 10ms

      await new Promise((resolve) => setTimeout(resolve, 15));

      expect(cache.get("key1")).toBeNull();
    });

    it("should handle very long TTL", () => {
      cache.set("key1", "value1", 3600); // 1 hour

      expect(cache.get("key1")).toBe("value1");

      const stats = cache.stats();
      expect(stats.size).toBe(1);
    });

    it("should update expiry when key is overwritten", async () => {
      cache.set("key1", "value1", 0.05); // 50ms

      await new Promise((resolve) => setTimeout(resolve, 30));

      cache.set("key1", "value2", 0.1); // 100ms

      await new Promise((resolve) => setTimeout(resolve, 30)); // Total 60ms

      // Original would have expired, but we updated it
      expect(cache.get("key1")).toBe("value2");
    });
  });

  describe("delete", () => {
    it("should delete existing key", () => {
      cache.set("key1", "value1");
      expect(cache.delete("key1")).toBe(true);
      expect(cache.get("key1")).toBeNull();
    });

    it("should return false for non-existent key", () => {
      expect(cache.delete("nonexistent")).toBe(false);
    });

    it("should handle deleting already deleted key", () => {
      cache.set("key1", "value1");
      cache.delete("key1");
      expect(cache.delete("key1")).toBe(false);
    });

    it("should not affect other keys when deleting", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      cache.delete("key2");

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBe("value3");
    });
  });

  describe("clear", () => {
    it("should clear all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      cache.clear();

      expect(cache.get("key1")).toBeNull();
      expect(cache.get("key2")).toBeNull();
      expect(cache.get("key3")).toBeNull();
      expect(cache.stats().size).toBe(0);
    });

    it("should reset statistics", () => {
      cache.set("key1", "value1");
      cache.get("key1"); // hit
      cache.get("key2"); // miss

      cache.clear();

      const stats = cache.stats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it("should handle clearing empty cache", () => {
      expect(() => cache.clear()).not.toThrow();
      expect(cache.stats().size).toBe(0);
    });
  });

  describe("stats", () => {
    it("should track cache size", () => {
      expect(cache.stats().size).toBe(0);

      cache.set("key1", "value1");
      expect(cache.stats().size).toBe(1);

      cache.set("key2", "value2");
      expect(cache.stats().size).toBe(2);

      cache.delete("key1");
      expect(cache.stats().size).toBe(1);
    });

    it("should track cache hits", () => {
      cache.set("key1", "value1");

      cache.get("key1");
      cache.get("key1");
      cache.get("key1");

      expect(cache.stats().hits).toBe(3);
    });

    it("should track cache misses", () => {
      cache.get("nonexistent1");
      cache.get("nonexistent2");
      cache.get("nonexistent3");

      expect(cache.stats().misses).toBe(3);
    });

    it("should calculate hit rate correctly", () => {
      cache.set("key1", "value1");

      cache.get("key1"); // hit
      cache.get("key1"); // hit
      cache.get("key2"); // miss

      const stats = cache.stats();
      expect(stats.hitRate).toBeCloseTo(2 / 3, 2);
    });

    it("should handle zero hit rate", () => {
      cache.get("nonexistent");

      const stats = cache.stats();
      expect(stats.hitRate).toBe(0);
    });

    it("should handle perfect hit rate", () => {
      cache.set("key1", "value1");
      cache.get("key1");
      cache.get("key1");

      const stats = cache.stats();
      expect(stats.hitRate).toBe(1);
    });

    it("should count expired entries as misses", async () => {
      cache.set("key1", "value1", 0.05);

      await new Promise((resolve) => setTimeout(resolve, 60));

      cache.get("key1"); // miss due to expiry

      expect(cache.stats().misses).toBe(1);
      expect(cache.stats().hits).toBe(0);
    });

    it("should report max size", () => {
      const stats = cache.stats();
      expect(stats.maxSize).toBe(10);
    });
  });

  describe("cleanup", () => {
    it("should remove expired entries", async () => {
      cache.set("expired1", "value1", 0.05);
      cache.set("expired2", "value2", 0.05);
      cache.set("active", "value3", 1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      const cleaned = cache.cleanup();

      expect(cleaned).toBe(2);
      expect(cache.get("active")).toBe("value3");
      expect(cache.stats().size).toBe(1);
    });

    it("should not remove active entries", () => {
      cache.set("key1", "value1", 1);
      cache.set("key2", "value2", 1);

      const cleaned = cache.cleanup();

      expect(cleaned).toBe(0);
      expect(cache.stats().size).toBe(2);
    });

    it("should handle empty cache", () => {
      const cleaned = cache.cleanup();
      expect(cleaned).toBe(0);
    });

    it("should handle all expired entries", async () => {
      cache.set("key1", "value1", 0.05);
      cache.set("key2", "value2", 0.05);
      cache.set("key3", "value3", 0.05);

      await new Promise((resolve) => setTimeout(resolve, 60));

      const cleaned = cache.cleanup();

      expect(cleaned).toBe(3);
      expect(cache.stats().size).toBe(0);
    });

    it("should handle mixed expired and active entries", async () => {
      cache.set("expired1", "value1", 0.05);
      cache.set("active1", "value2", 1);
      cache.set("expired2", "value3", 0.05);
      cache.set("active2", "value4", 1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      const cleaned = cache.cleanup();

      expect(cleaned).toBe(2);
      expect(cache.get("active1")).toBe("value2");
      expect(cache.get("active2")).toBe("value4");
    });
  });

  describe("Size Limits", () => {
    it("should enforce max size", () => {
      const smallCache = new MemoryCache(3);

      smallCache.set("key1", "value1");
      smallCache.set("key2", "value2");
      smallCache.set("key3", "value3");

      expect(smallCache.stats().size).toBe(3);

      smallCache.set("key4", "value4"); // Should evict oldest

      expect(smallCache.stats().size).toBe(3);
    });

    it("should evict oldest entry when full (FIFO)", () => {
      const smallCache = new MemoryCache(3);

      smallCache.set("key1", "value1");
      smallCache.set("key2", "value2");
      smallCache.set("key3", "value3");
      smallCache.set("key4", "value4");

      // key1 should be evicted
      expect(smallCache.get("key1")).toBeNull();
      expect(smallCache.get("key2")).toBe("value2");
      expect(smallCache.get("key3")).toBe("value3");
      expect(smallCache.get("key4")).toBe("value4");
    });

    it("should handle single entry cache", () => {
      const tinyCache = new MemoryCache(1);

      tinyCache.set("key1", "value1");
      expect(tinyCache.get("key1")).toBe("value1");

      tinyCache.set("key2", "value2");
      expect(tinyCache.get("key1")).toBeNull();
      expect(tinyCache.get("key2")).toBe("value2");
    });

    it("should handle very large cache", () => {
      const largeCache = new MemoryCache(10000);

      for (let i = 0; i < 1000; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }

      expect(largeCache.stats().size).toBe(1000);
    });
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent sets", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      expect(cache.stats().size).toBe(3);
    });

    it("should handle concurrent gets", () => {
      cache.set("key1", "value1");

      const results = [cache.get("key1"), cache.get("key1"), cache.get("key1")];

      expect(results).toEqual(["value1", "value1", "value1"]);
      expect(cache.stats().hits).toBe(3);
    });

    it("should handle concurrent set and get", () => {
      cache.set("key1", "value1");
      const value = cache.get("key1");
      cache.set("key1", "value2");

      expect(value).toBe("value1");
      expect(cache.get("key1")).toBe("value2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle unicode keys", () => {
      cache.set("用户123", "中文数据");
      cache.set("🎉🎊", "emoji data");

      expect(cache.get("用户123")).toBe("中文数据");
      expect(cache.get("🎉🎊")).toBe("emoji data");
    });

    it("should handle very long keys", () => {
      const longKey = "k".repeat(10000);
      cache.set(longKey, "value");

      expect(cache.get(longKey)).toBe("value");
    });

    it("should handle very large values", () => {
      const largeValue = { data: "x".repeat(100000) };
      cache.set("large", largeValue);

      expect(cache.get("large")).toEqual(largeValue);
    });

    it("should handle null-like key names", () => {
      cache.set("null", "value1");
      cache.set("undefined", "value2");
      cache.set("NaN", "value3");

      expect(cache.get("null")).toBe("value1");
      expect(cache.get("undefined")).toBe("value2");
      expect(cache.get("NaN")).toBe("value3");
    });

    it("should handle rapid set/get cycles", () => {
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i % 10}`, `value${i}`);
        cache.get(`key${i % 10}`);
      }

      expect(cache.stats().hits).toBeGreaterThan(0);
    });

    it("should handle setting same key multiple times", () => {
      for (let i = 0; i < 100; i++) {
        cache.set("sameKey", `value${i}`);
      }

      expect(cache.get("sameKey")).toBe("value99");
      expect(cache.stats().size).toBe(1);
    });
  });

  describe("Integration Scenarios", () => {
    it("should simulate API response caching", () => {
      const apiCache = new MemoryCache(100);

      // Cache API responses
      apiCache.set("/api/users", { users: [{ id: 1 }] }, 60);
      apiCache.set("/api/products", { products: [{ id: 1 }] }, 60);

      // Retrieve from cache
      expect(apiCache.get("/api/users")).toEqual({ users: [{ id: 1 }] });
      expect(apiCache.get("/api/products")).toEqual({ products: [{ id: 1 }] });

      const stats = apiCache.stats();
      expect(stats.hits).toBe(2);
      expect(stats.hitRate).toBe(1);
    });

    it("should simulate database query caching", async () => {
      const dbCache = new MemoryCache(50);

      // Cache query results with short TTL
      dbCache.set("query:users:active", [{ id: 1 }, { id: 2 }], 0.1);

      // Multiple reads hit cache
      dbCache.get("query:users:active");
      dbCache.get("query:users:active");

      expect(dbCache.stats().hits).toBe(2);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 110));

      // After expiry, miss
      expect(dbCache.get("query:users:active")).toBeNull();
      expect(dbCache.stats().misses).toBe(1);
    });

    it("should simulate session storage", () => {
      const sessionCache = new MemoryCache(1000);

      const sessionId = "sess_123456";
      const sessionData = {
        userId: "user123",
        loggedIn: true,
        lastAccess: Date.now(),
      };

      sessionCache.set(sessionId, sessionData, 1800); // 30 min

      const retrieved = sessionCache.get(sessionId);
      expect(retrieved).toEqual(sessionData);
    });

    it("should simulate cache invalidation pattern", () => {
      const dataCache = new MemoryCache(100);

      // Cache data
      dataCache.set("user:123", { name: "John" }, 300);
      dataCache.set("user:123:posts", [{ id: 1 }], 300);

      // Verify cached
      expect(dataCache.get("user:123")).toBeTruthy();
      expect(dataCache.get("user:123:posts")).toBeTruthy();

      // Invalidate related caches
      dataCache.delete("user:123");
      dataCache.delete("user:123:posts");

      // Verify invalidated
      expect(dataCache.get("user:123")).toBeNull();
      expect(dataCache.get("user:123:posts")).toBeNull();
    });

    it("should simulate high-traffic caching", () => {
      const hotCache = new MemoryCache(1000);

      // Simulate many concurrent requests
      for (let i = 0; i < 10000; i++) {
        const key = `item${i % 100}`; // 100 unique items

        const cached = hotCache.get(key);
        if (!cached) {
          hotCache.set(key, { id: i % 100, data: "item data" }, 300);
        }
      }

      const stats = hotCache.stats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it("should handle cache warming", () => {
      const warmCache = new MemoryCache(100);

      // Pre-populate cache
      const popularItems = [
        { id: 1, name: "Popular Item 1" },
        { id: 2, name: "Popular Item 2" },
        { id: 3, name: "Popular Item 3" },
      ];

      popularItems.forEach((item) => {
        warmCache.set(`item:${item.id}`, item, 3600);
      });

      // Verify all items are cached
      expect(warmCache.get("item:1")).toEqual(popularItems[0]);
      expect(warmCache.get("item:2")).toEqual(popularItems[1]);
      expect(warmCache.get("item:3")).toEqual(popularItems[2]);

      expect(warmCache.stats().hits).toBe(3);
      expect(warmCache.stats().size).toBe(3);
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory with repeated operations", () => {
      for (let i = 0; i < 10000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      cache.clear();
      expect(cache.stats().size).toBe(0);
    });

    it("should handle cleanup of large cache", async () => {
      const largeCache = new MemoryCache(1000);

      // Fill with expiring entries
      for (let i = 0; i < 500; i++) {
        largeCache.set(`key${i}`, `value${i}`, 0.05);
      }

      await new Promise((resolve) => setTimeout(resolve, 60));

      const cleaned = largeCache.cleanup();
      expect(cleaned).toBe(500);
      expect(largeCache.stats().size).toBe(0);
    });

    it("should handle alternating set/delete pattern", () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
        if (i % 2 === 0) {
          cache.delete(`key${i}`);
        }
      }

      const stats = cache.stats();
      expect(stats.size).toBeLessThanOrEqual(10);
    });
  });
});
