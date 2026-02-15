/**
 * @jest-environment jsdom
 */

import { StorageManager } from "../StorageManager";

describe("StorageManager", () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Reset singleton instance
    (StorageManager as any).instance = undefined;
    storage = StorageManager.getInstance("test_");

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("Singleton Pattern", () => {
    it("should return same instance", () => {
      const storage1 = StorageManager.getInstance();
      const storage2 = StorageManager.getInstance();
      expect(storage1).toBe(storage2);
    });

    it("should initialize with default prefix", () => {
      (StorageManager as any).instance = undefined;
      const defaultStorage = StorageManager.getInstance();
      expect(defaultStorage).toBeInstanceOf(StorageManager);
    });

    it("should accept custom prefix", () => {
      (StorageManager as any).instance = undefined;
      const customStorage = StorageManager.getInstance("custom_");
      expect(customStorage).toBeInstanceOf(StorageManager);
    });
  });

  describe("set() - localStorage", () => {
    it("should store string value", () => {
      const result = storage.set("key1", "value1");
      expect(result).toBe(true);
      expect(storage.get("key1")).toBe("value1");
    });

    it("should store object value", () => {
      const obj = { name: "test", count: 42 };
      storage.set("obj", obj);
      expect(storage.get("obj")).toEqual(obj);
    });

    it("should store array value", () => {
      const arr = [1, 2, 3, 4, 5];
      storage.set("arr", arr);
      expect(storage.get("arr")).toEqual(arr);
    });

    it("should overwrite existing value", () => {
      storage.set("key1", "value1");
      storage.set("key1", "value2");
      expect(storage.get("key1")).toBe("value2");
    });

    it("should add prefix to key", () => {
      storage.set("mykey", "myvalue");
      const rawValue = localStorage.getItem("test_mykey");
      expect(rawValue).toBe('"myvalue"');
    });

    it("should serialize complex objects", () => {
      const complex = {
        nested: { deep: { value: "test" } },
        array: [1, 2, 3],
        bool: true,
        null: null,
      };
      storage.set("complex", complex);
      expect(storage.get("complex")).toEqual(complex);
    });
  });

  describe("set() - sessionStorage", () => {
    it("should store in session storage", () => {
      storage.set("key1", "value1", { type: "session" });
      const rawValue = sessionStorage.getItem("test_key1");
      expect(rawValue).toBe('"value1"');
    });

    it("should not affect localStorage", () => {
      storage.set("key1", "local", { type: "local" });
      storage.set("key1", "session", { type: "session" });

      expect(storage.get("key1", { type: "local" })).toBe("local");
      expect(storage.get("key1", { type: "session" })).toBe("session");
    });
  });

  describe("get() - localStorage", () => {
    it("should retrieve stored value", () => {
      storage.set("key1", "value1");
      expect(storage.get("key1")).toBe("value1");
    });

    it("should return null for non-existent key", () => {
      expect(storage.get("nonexistent")).toBeNull();
    });

    it("should deserialize objects", () => {
      const obj = { name: "test", value: 123 };
      storage.set("obj", obj);
      expect(storage.get("obj")).toEqual(obj);
    });

    it("should preserve type information", () => {
      interface User {
        name: string;
        age: number;
      }
      const user: User = { name: "John", age: 30 };
      storage.set("user", user);
      const retrieved = storage.get<User>("user");
      expect(retrieved?.name).toBe("John");
      expect(retrieved?.age).toBe(30);
    });

    it("should handle corrupted data gracefully", () => {
      localStorage.setItem("test_corrupted", "{invalid json}");
      expect(storage.get("corrupted")).toBeNull();
    });
  });

  describe("get() - sessionStorage", () => {
    it("should retrieve from session storage", () => {
      storage.set("key1", "value1", { type: "session" });
      expect(storage.get("key1", { type: "session" })).toBe("value1");
    });

    it("should return null for non-existent session key", () => {
      expect(storage.get("nonexistent", { type: "session" })).toBeNull();
    });
  });

  describe("remove()", () => {
    it("should remove item from localStorage", () => {
      storage.set("key1", "value1");
      const result = storage.remove("key1");

      expect(result).toBe(true);
      expect(storage.get("key1")).toBeNull();
    });

    it("should remove item from sessionStorage", () => {
      storage.set("key1", "value1", { type: "session" });
      const result = storage.remove("key1", { type: "session" });

      expect(result).toBe(true);
      expect(storage.get("key1", { type: "session" })).toBeNull();
    });

    it("should return true even if key does not exist", () => {
      const result = storage.remove("nonexistent");
      expect(result).toBe(true);
    });

    it("should only remove prefixed key", () => {
      localStorage.setItem("other_key", "value");
      storage.remove("key");
      expect(localStorage.getItem("other_key")).toBe("value");
    });
  });

  describe("clear()", () => {
    it("should clear all items with prefix from localStorage", () => {
      storage.set("key1", "value1");
      storage.set("key2", "value2");
      storage.set("key3", "value3");

      const result = storage.clear();

      expect(result).toBe(true);
      expect(storage.get("key1")).toBeNull();
      expect(storage.get("key2")).toBeNull();
      expect(storage.get("key3")).toBeNull();
    });

    it("should clear all items with prefix from sessionStorage", () => {
      storage.set("key1", "value1", { type: "session" });
      storage.set("key2", "value2", { type: "session" });

      storage.clear({ type: "session" });

      expect(storage.get("key1", { type: "session" })).toBeNull();
      expect(storage.get("key2", { type: "session" })).toBeNull();
    });

    it("should not remove items with different prefix", () => {
      localStorage.setItem("other_key", "value");
      storage.set("key1", "value1");

      storage.clear();

      expect(localStorage.getItem("other_key")).toBe("value");
    });

    it("should work on empty storage", () => {
      const result = storage.clear();
      expect(result).toBe(true);
    });
  });

  describe("has()", () => {
    it("should return true for existing key in localStorage", () => {
      storage.set("key1", "value1");
      expect(storage.has("key1")).toBe(true);
    });

    it("should return false for non-existent key", () => {
      expect(storage.has("nonexistent")).toBe(false);
    });

    it("should return true for existing key in sessionStorage", () => {
      storage.set("key1", "value1", { type: "session" });
      expect(storage.has("key1", { type: "session" })).toBe(true);
    });

    it("should handle corrupted data", () => {
      localStorage.setItem("test_corrupted", "{invalid}");
      expect(storage.has("corrupted")).toBe(false);
    });
  });

  describe("keys()", () => {
    it("should return empty array for empty storage", () => {
      expect(storage.keys()).toEqual([]);
    });

    it("should return all keys from localStorage", () => {
      storage.set("key1", "value1");
      storage.set("key2", "value2");
      storage.set("key3", "value3");

      const keys = storage.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys).toContain("key3");
    });

    it("should return all keys from sessionStorage", () => {
      storage.set("key1", "value1", { type: "session" });
      storage.set("key2", "value2", { type: "session" });

      const keys = storage.keys({ type: "session" });
      expect(keys).toHaveLength(2);
    });

    it("should only return keys with matching prefix", () => {
      localStorage.setItem("other_key", "value");
      storage.set("key1", "value1");

      const keys = storage.keys();
      expect(keys).toEqual(["key1"]);
    });

    it("should strip prefix from returned keys", () => {
      storage.set("mykey", "value");
      const keys = storage.keys();
      expect(keys).toEqual(["mykey"]);
      expect(keys).not.toContain("test_mykey");
    });
  });

  describe("getAll()", () => {
    it("should return empty object for empty storage", () => {
      expect(storage.getAll()).toEqual({});
    });

    it("should return all items from localStorage", () => {
      storage.set("key1", "value1");
      storage.set("key2", { name: "test" });

      const all = storage.getAll();
      expect(all).toEqual({
        key1: "value1",
        key2: { name: "test" },
      });
    });

    it("should return all items from sessionStorage", () => {
      storage.set("key1", "value1", { type: "session" });
      storage.set("key2", "value2", { type: "session" });

      const all = storage.getAll({ type: "session" });
      expect(all.key1).toBe("value1");
      expect(all.key2).toBe("value2");
    });

    it("should handle corrupted data gracefully", () => {
      storage.set("key1", "value1");
      localStorage.setItem("test_corrupted", "{invalid}");

      const all = storage.getAll();
      expect(all.key1).toBe("value1");
      expect(all.corrupted).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null values", () => {
      storage.set("null", null);
      expect(storage.get("null")).toBeNull();
    });

    it("should handle undefined values", () => {
      storage.set("undef", undefined);
      expect(storage.get("undef")).toBeNull();
    });

    it("should handle boolean values", () => {
      storage.set("true", true);
      storage.set("false", false);
      expect(storage.get("true")).toBe(true);
      expect(storage.get("false")).toBe(false);
    });

    it("should handle numeric values", () => {
      storage.set("zero", 0);
      storage.set("negative", -42);
      expect(storage.get("zero")).toBe(0);
      expect(storage.get("negative")).toBe(-42);
    });

    it("should handle empty strings", () => {
      storage.set("empty", "");
      expect(storage.get("empty")).toBe("");
    });

    it("should handle special characters in keys", () => {
      storage.set("key-with-dash", "value1");
      storage.set("key.with.dots", "value2");
      storage.set("key:with:colons", "value3");

      expect(storage.get("key-with-dash")).toBe("value1");
      expect(storage.get("key.with.dots")).toBe("value2");
      expect(storage.get("key:with:colons")).toBe("value3");
    });

    it("should handle Date objects", () => {
      const date = new Date("2024-01-01");
      storage.set("date", date);
      const retrieved = storage.get<Date>("date");
      // Dates are serialized as strings
      expect(typeof retrieved).toBe("string");
    });

    it("should handle nested objects", () => {
      const nested = {
        level1: {
          level2: {
            level3: "deep value",
            array: [1, 2, 3],
          },
        },
      };
      storage.set("nested", nested);
      expect(storage.get("nested")).toEqual(nested);
    });

    it("should handle large data", () => {
      const largeArray = Array(1000)
        .fill(0)
        .map((_, i) => ({ id: i, value: `item-${i}` }));
      storage.set("large", largeArray);
      expect(storage.get("large")).toEqual(largeArray);
    });
  });

  describe.skip("Server-Side Rendering (SSR)", () => {
    it("should handle undefined window gracefully", () => {
      // Mock SSR environment by removing localStorage/sessionStorage
      const originalWindow = global.window;
      const originalLocalStorage = global.window.localStorage;
      const originalSessionStorage = global.window.sessionStorage;

      delete (global as any).window;

      // Reset singleton after deleting window
      (StorageManager as any).instance = undefined;
      const ssrStorage = StorageManager.getInstance("test_");

      const result = ssrStorage.set("key", "value");
      expect(result).toBe(false);

      // Restore window
      (global as any).window = originalWindow;
      (global.window as any).localStorage = originalLocalStorage;
      (global.window as any).sessionStorage = originalSessionStorage;
    });

    it("should return null on get in SSR", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      // Reset singleton after deleting window
      (StorageManager as any).instance = undefined;
      const ssrStorage = StorageManager.getInstance("test_");

      const result = ssrStorage.get("key");
      expect(result).toBeNull();

      (global as any).window = originalWindow;
    });

    it("should return false on remove in SSR", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      // Reset singleton after deleting window
      (StorageManager as any).instance = undefined;
      const ssrStorage = StorageManager.getInstance("test_");

      const result = ssrStorage.remove("key");
      expect(result).toBe(false);

      (global as any).window = originalWindow;
    });

    it("should return false on clear in SSR", () => {
      const originalWindow = global.window;
      delete (global as any).window;

      // Reset singleton after deleting window
      (StorageManager as any).instance = undefined;
      const ssrStorage = StorageManager.getInstance("test_");

      const result = ssrStorage.clear();
      expect(result).toBe(false);

      (global as any).window = originalWindow;
    });
  });
});
