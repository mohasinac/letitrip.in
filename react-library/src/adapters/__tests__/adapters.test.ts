/**
 * Adapter Tests - Firebase, Examples, and Types
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InMemoryCacheAdapter,
  LocalStorageCacheAdapter,
  MockUploadService,
  SupabaseStorageAdapter,
} from "../examples";
import {
  FirebaseAuthAdapter,
  FirebaseFirestoreAdapter,
  FirebaseStorageAdapter,
} from "../firebase";

describe("Firebase Adapters", () => {
  describe("FirebaseFirestoreAdapter", () => {
    it("creates adapter with firestore instance", () => {
      const mockDb = {} as any;
      const adapter = new FirebaseFirestoreAdapter(mockDb);

      expect(adapter).toBeInstanceOf(FirebaseFirestoreAdapter);
    });
  });

  describe("FirebaseStorageAdapter", () => {
    it("creates adapter with storage instance", () => {
      const mockStorage = {} as any;
      const adapter = new FirebaseStorageAdapter(mockStorage);

      expect(adapter).toBeInstanceOf(FirebaseStorageAdapter);
    });
  });

  describe("FirebaseAuthAdapter", () => {
    it("creates adapter with auth instance", () => {
      const mockAuth = {} as any;
      const adapter = new FirebaseAuthAdapter(mockAuth);

      expect(adapter).toBeInstanceOf(FirebaseAuthAdapter);
    });
  });
});

describe("Cache Adapters", () => {
  describe("LocalStorageCacheAdapter", () => {
    let adapter: LocalStorageCacheAdapter;

    beforeEach(() => {
      // Mock localStorage
      const storage: Record<string, string> = {};
      global.localStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
        removeItem: (key: string) => {
          delete storage[key];
        },
        clear: () => {
          for (const key in storage) {
            delete storage[key];
          }
        },
        length: 0,
        key: () => null,
      };

      adapter = new LocalStorageCacheAdapter();
    });

    it("sets and gets values", async () => {
      await adapter.set("test-key", { value: "test-data" });
      const result = await adapter.get("test-key");

      expect(result).toEqual({ value: "test-data" });
    });

    it("returns null for non-existent keys", async () => {
      const result = await adapter.get("non-existent");

      expect(result).toBeNull();
    });

    it("deletes values", async () => {
      await adapter.set("test-key", { value: "test-data" });
      await adapter.delete("test-key");
      const result = await adapter.get("test-key");

      expect(result).toBeNull();
    });

    it("clears all values", async () => {
      await adapter.set("key1", { value: 1 });
      await adapter.set("key2", { value: 2 });
      await adapter.clear();

      const result1 = await adapter.get("key1");
      const result2 = await adapter.get("key2");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it("respects TTL expiration", async () => {
      await adapter.set("test-key", { value: "test-data" }, 1); // 1 second TTL

      // Wait 1.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await adapter.get("test-key");

      expect(result).toBeNull();
    });

    it("handles invalid JSON gracefully", async () => {
      localStorage.setItem("test-key", "invalid-json{");

      const result = await adapter.get("test-key");

      expect(result).toBeNull();
    });
  });

  describe("InMemoryCacheAdapter", () => {
    let adapter: InMemoryCacheAdapter;

    beforeEach(() => {
      adapter = new InMemoryCacheAdapter();
    });

    it("sets and gets values", async () => {
      await adapter.set("test-key", { value: "test-data" });
      const result = await adapter.get("test-key");

      expect(result).toEqual({ value: "test-data" });
    });

    it("returns null for non-existent keys", async () => {
      const result = await adapter.get("non-existent");

      expect(result).toBeNull();
    });

    it("deletes values", async () => {
      await adapter.set("test-key", { value: "test-data" });
      await adapter.delete("test-key");
      const result = await adapter.get("test-key");

      expect(result).toBeNull();
    });

    it("clears all values", async () => {
      await adapter.set("key1", { value: 1 });
      await adapter.set("key2", { value: 2 });
      await adapter.clear();

      const result1 = await adapter.get("key1");
      const result2 = await adapter.get("key2");

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it("respects TTL expiration", async () => {
      await adapter.set("test-key", { value: "test-data" }, 1); // 1 second TTL

      // Wait 1.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = await adapter.get("test-key");

      expect(result).toBeNull();
    });

    it("handles concurrent operations", async () => {
      const operations = Array.from({ length: 100 }, (_, i) =>
        adapter.set(`key-${i}`, { value: i })
      );

      await Promise.all(operations);

      const result = await adapter.get("key-50");
      expect(result).toEqual({ value: 50 });
    });
  });
});

describe("Mock Upload Service", () => {
  describe("MockUploadService", () => {
    it("uploads file successfully", async () => {
      const service = new MockUploadService();
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const url = await service.upload(file);

      expect(url).toContain("mock-url");
      expect(url).toContain("test.jpg");
    });

    it("respects delay parameter", async () => {
      const delay = 500;
      const service = new MockUploadService(delay);
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const startTime = Date.now();
      await service.upload(file);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(delay - 50); // 50ms tolerance
    });

    it("fails when shouldFail is true", async () => {
      const service = new MockUploadService(0, true);
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await expect(service.upload(file)).rejects.toThrow("Mock upload failed");
    });

    it("includes file metadata in URL", async () => {
      const service = new MockUploadService();
      const file = new File(["test"], "my-image.png", { type: "image/png" });

      const url = await service.upload(file);

      expect(url).toContain("my-image.png");
    });

    it("supports progress tracking", async () => {
      const service = new MockUploadService(500);
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const onProgress = vi.fn();

      const uploadPromise = service.upload(file, { onProgress });

      await new Promise((resolve) => setTimeout(resolve, 250));

      // Progress should be called during upload
      expect(onProgress).toHaveBeenCalled();

      await uploadPromise;

      // Final progress should be 100
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });
  });
});

describe("Supabase Adapter", () => {
  describe("SupabaseStorageAdapter", () => {
    it("creates adapter with storage client and bucket", () => {
      const mockStorage = {} as any;
      const adapter = new SupabaseStorageAdapter(mockStorage, "test-bucket");

      expect(adapter).toBeInstanceOf(SupabaseStorageAdapter);
    });

    it("uses correct bucket name", async () => {
      const mockStorage = {
        from: vi.fn().mockReturnValue({
          upload: vi
            .fn()
            .mockResolvedValue({ data: { path: "test-path" }, error: null }),
          getPublicUrl: vi
            .fn()
            .mockReturnValue({ data: { publicUrl: "public-url" } }),
        }),
      } as any;

      const adapter = new SupabaseStorageAdapter(mockStorage, "my-bucket");
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await adapter.upload(file, "test-path");

      expect(mockStorage.from).toHaveBeenCalledWith("my-bucket");
    });

    it("handles upload success", async () => {
      const mockBucket = {
        upload: vi
          .fn()
          .mockResolvedValue({ data: { path: "test-path" }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: "https://example.com/test.jpg" },
        }),
      };

      const mockStorage = {
        from: vi.fn().mockReturnValue(mockBucket),
      } as any;

      const adapter = new SupabaseStorageAdapter(mockStorage, "test-bucket");
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const url = await adapter.upload(file, "test-path");

      expect(url).toBe("https://example.com/test.jpg");
      expect(mockBucket.upload).toHaveBeenCalledWith("test-path", file);
    });

    it("handles upload error", async () => {
      const mockBucket = {
        upload: vi
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: "Upload failed" },
          }),
      };

      const mockStorage = {
        from: vi.fn().mockReturnValue(mockBucket),
      } as any;

      const adapter = new SupabaseStorageAdapter(mockStorage, "test-bucket");
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await expect(adapter.upload(file, "test-path")).rejects.toThrow(
        "Upload failed"
      );
    });

    it("handles delete success", async () => {
      const mockBucket = {
        remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      };

      const mockStorage = {
        from: vi.fn().mockReturnValue(mockBucket),
      } as any;

      const adapter = new SupabaseStorageAdapter(mockStorage, "test-bucket");

      await adapter.delete("test-path");

      expect(mockBucket.remove).toHaveBeenCalledWith(["test-path"]);
    });

    it("handles delete error", async () => {
      const mockBucket = {
        remove: vi
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: "Delete failed" },
          }),
      };

      const mockStorage = {
        from: vi.fn().mockReturnValue(mockBucket),
      } as any;

      const adapter = new SupabaseStorageAdapter(mockStorage, "test-bucket");

      await expect(adapter.delete("test-path")).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});

describe("Adapter Integration", () => {
  it("cache adapters work interchangeably", async () => {
    const localAdapter = new LocalStorageCacheAdapter();
    const memoryAdapter = new InMemoryCacheAdapter();

    const testData = { value: "test", count: 42 };

    await localAdapter.set("test", testData);
    await memoryAdapter.set("test", testData);

    const localResult = await localAdapter.get("test");
    const memoryResult = await memoryAdapter.get("test");

    expect(localResult).toEqual(testData);
    expect(memoryResult).toEqual(testData);
    expect(localResult).toEqual(memoryResult);
  });

  it("upload services handle errors consistently", async () => {
    const mockService = new MockUploadService(0, true);
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await expect(mockService.upload(file)).rejects.toThrow();
  });
});
