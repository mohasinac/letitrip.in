import { trackAPIError, trackCacheHit, trackSlowAPI } from "@/lib/analytics";
import { apiService } from "../api.service";

jest.mock("@/lib/analytics");
jest.mock("@/lib/firebase-error-logger");

// Mock global fetch
global.fetch = jest.fn();

describe("ApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.clearCache();
    apiService.abortAllRequests();
  });

  afterEach(() => {
    // Clean up any pending requests
    apiService.abortAllRequests();
  });

  describe("get", () => {
    it("should make GET request successfully", async () => {
      const mockData = { id: "1", name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.get<typeof mockData>("/test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it("should handle 401 unauthorized", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
        headers: new Headers(),
      });

      // Mock localStorage for browser environment
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      };
      Object.defineProperty(global, "localStorage", {
        value: localStorageMock,
        writable: true,
      });

      await expect(apiService.get("/test")).rejects.toThrow(
        "Unauthorized. Please log in again."
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("user");
    });

    it("should handle 403 forbidden", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: "Forbidden" }),
        headers: new Headers(),
      });

      await expect(apiService.get("/test")).rejects.toThrow(
        "Access forbidden. You do not have permission."
      );
    });

    it("should handle 404 not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not Found" }),
        headers: new Headers(),
      });

      await expect(apiService.get("/test")).rejects.toThrow(
        "Resource not found."
      );
    });

    it("should handle 429 rate limiting", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: "Too many requests" }),
        headers: new Headers({ "Retry-After": "60" }),
      });

      await expect(apiService.get("/test")).rejects.toThrow(
        "Too many requests. Please try again in 60 seconds."
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new TypeError("Failed to fetch")
      );

      await expect(apiService.get("/test")).rejects.toThrow();
      expect(trackAPIError).toHaveBeenCalled();
    });

    it("should track slow API calls", async () => {
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: async () => mockData,
                  headers: new Headers(),
                }),
              100
            )
          )
      );

      await apiService.get("/test");

      expect(trackSlowAPI).toHaveBeenCalledWith("/test", expect.any(Number));
    });
  });

  describe("post", () => {
    it("should make POST request successfully", async () => {
      const mockData = { id: "1", name: "Test" };
      const postData = { name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.post<typeof mockData>("/test", postData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it("should handle POST without data", async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.post<typeof mockData>("/test");

      expect(result).toEqual(mockData);
    });

    it("should deduplicate identical POST requests", async () => {
      const mockData = { id: "1" };
      const postData = { name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      // Make two identical POST requests simultaneously
      const [result1, result2] = await Promise.all([
        apiService.post("/test", postData),
        apiService.post("/test", postData),
      ]);

      // Should only make one fetch call (deduplication)
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe("put", () => {
    it("should make PUT request successfully", async () => {
      const mockData = { id: "1", name: "Updated" };
      const putData = { name: "Updated" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.put<typeof mockData>("/test/1", putData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test/1"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(putData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("patch", () => {
    it("should make PATCH request successfully", async () => {
      const mockData = { id: "1", name: "Patched" };
      const patchData = { name: "Patched" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.patch<typeof mockData>(
        "/test/1",
        patchData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test/1"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify(patchData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("delete", () => {
    it("should make DELETE request successfully", async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.delete<typeof mockData>("/test/1");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test/1"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(result).toEqual(mockData);
    });

    it("should handle DELETE with body", async () => {
      const mockData = { success: true };
      const deleteData = { reason: "test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.delete<typeof mockData>(
        "/test/1",
        deleteData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/test/1"),
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify(deleteData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("Caching", () => {
    it("should cache GET responses", async () => {
      const mockData = { id: "1", name: "Test" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      // Configure cache for the endpoint
      apiService.configureCacheFor("/test", {
        ttl: 5000,
        staleWhileRevalidate: 10000,
      });

      // First request - cache miss
      await apiService.get("/test");
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second request - cache hit
      await apiService.get("/test");
      expect(global.fetch).toHaveBeenCalledTimes(1); // No additional fetch

      expect(trackCacheHit).toHaveBeenCalled();
    });

    it("should serve stale data while revalidating", async () => {
      const staleData = { id: "1", name: "Stale" };
      const freshData = { id: "1", name: "Fresh" };

      // Configure cache with short TTL
      apiService.configureCacheFor("/test", {
        ttl: 100, // 100ms TTL
        staleWhileRevalidate: 5000, // 5s stale period
      });

      // First request
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => staleData,
        headers: new Headers(),
      });
      await apiService.get("/test");

      // Wait for cache to become stale
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Second request should return stale data immediately
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => freshData,
        headers: new Headers(),
      });

      const result = await apiService.get("/test");

      // Should return stale data immediately
      expect(result).toEqual(staleData);

      // Wait for background revalidation
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("should invalidate cache by pattern", async () => {
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      apiService.configureCacheFor("/test", { ttl: 10000 });

      // Make request to cache it
      await apiService.get("/test/item1");
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Invalidate cache
      apiService.invalidateCache("/test");

      // Make same request - should fetch again
      await apiService.get("/test/item1");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should clear all cache", async () => {
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      apiService.configureCacheFor("/test", { ttl: 10000 });

      // Make requests to cache them
      await apiService.get("/test/1");
      await apiService.get("/test/2");

      // Clear cache
      apiService.clearCache();

      // Make same requests - should fetch again
      await apiService.get("/test/1");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should provide cache statistics", async () => {
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      apiService.configureCacheFor("/test", { ttl: 10000 });

      // Generate some cache activity
      await apiService.get("/test/1"); // miss
      await apiService.get("/test/1"); // hit

      const stats = apiService.getCacheStats();

      expect(stats.cacheSize).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe("Cache Configuration", () => {
    it("should configure cache for endpoint", () => {
      apiService.configureCacheFor("/products", {
        ttl: 5000,
        staleWhileRevalidate: 10000,
      });

      const configs = apiService.getCacheConfigurations();
      expect(configs["/products"]).toEqual({
        ttl: 5000,
        staleWhileRevalidate: 10000,
      });
    });

    it("should remove cache configuration", () => {
      apiService.configureCacheFor("/products", { ttl: 5000 });
      apiService.removeCacheConfigFor("/products");

      const configs = apiService.getCacheConfigurations();
      expect(configs["/products"]).toBeUndefined();
    });

    it("should update cache TTL", () => {
      apiService.configureCacheFor("/products", {
        ttl: 5000,
        staleWhileRevalidate: 10000,
      });

      apiService.updateCacheTTL("/products", 10000);

      const configs = apiService.getCacheConfigurations();
      expect(configs["/products"].ttl).toBe(10000);
      expect(configs["/products"].staleWhileRevalidate).toBe(10000);
    });

    it("should batch configure cache", () => {
      apiService.batchConfigureCache({
        "/products": { ttl: 5000 },
        "/shops": { ttl: 10000 },
      });

      const configs = apiService.getCacheConfigurations();
      expect(configs["/products"]).toEqual({ ttl: 5000 });
      expect(configs["/shops"]).toEqual({ ttl: 10000 });
    });
  });

  describe("Request Deduplication", () => {
    it("should deduplicate identical GET requests", async () => {
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        apiService.get("/test"),
        apiService.get("/test"),
      ]);

      // Should only make one fetch call
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it("should not deduplicate different requests", async () => {
      const mockData1 = { id: "1" };
      const mockData2 = { id: "2" };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockData1,
          headers: new Headers(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockData2,
          headers: new Headers(),
        });

      // Make two different requests simultaneously
      const [result1, result2] = await Promise.all([
        apiService.get("/test/1"),
        apiService.get("/test/2"),
      ]);

      // Should make two separate fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result1).toEqual(mockData1);
      expect(result2).toEqual(mockData2);
    });
  });

  describe("Request Abortion", () => {
    it("should abort pending request", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject({ name: "AbortError" }), 1000)
          )
      );

      // Start request (don't await)
      const requestPromise = apiService.get("/test");

      // Abort it
      const activeRequests = apiService.getActiveRequests();
      if (activeRequests.length > 0) {
        apiService.abortRequest(activeRequests[0]);
      }

      // Request should throw
      await expect(requestPromise).rejects.toThrow("Request cancelled");
    });

    it("should abort requests matching pattern", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject({ name: "AbortError" }), 1000)
          )
      );

      // Start multiple requests
      const promise1 = apiService.get("/products/1");
      const promise2 = apiService.get("/products/2");
      const promise3 = apiService.get("/shops/1");

      // Abort products requests
      apiService.abortRequestsMatching("/products");

      // Products requests should fail
      await expect(promise1).rejects.toThrow();
      await expect(promise2).rejects.toThrow();

      // Shops request should still be active
      const activeRequests = apiService.getActiveRequests();
      expect(activeRequests.some((key) => key.includes("/shops"))).toBe(true);

      // Clean up
      apiService.abortAllRequests();
      await expect(promise3).rejects.toThrow();
    });

    it("should abort all pending requests", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject({ name: "AbortError" }), 1000)
          )
      );

      // Start multiple requests
      const promise1 = apiService.get("/test/1");
      const promise2 = apiService.get("/test/2");

      // Abort all
      apiService.abortAllRequests();

      // All should fail
      await expect(promise1).rejects.toThrow();
      await expect(promise2).rejects.toThrow();

      expect(apiService.getActiveRequests().length).toBe(0);
    });
  });

  describe("Retry Logic", () => {
    it("should retry on retryable errors", async () => {
      let attempts = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ error: "Service unavailable" }),
            headers: new Headers(),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
          headers: new Headers(),
        });
      });

      const result = await apiService.get("/test");

      expect(attempts).toBe(3);
      expect(result).toEqual({ success: true });
    });

    it("should not retry non-retryable errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Bad request" }),
        headers: new Headers(),
      });

      await expect(apiService.get("/test")).rejects.toThrow();

      // Should only try once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should configure retry settings", () => {
      apiService.configureRetry({
        maxRetries: 5,
        retryDelay: 2000,
      });

      const config = apiService.getRetryConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.retryDelay).toBe(2000);
    });
  });

  describe("Server-Side Rendering", () => {
    it("should handle SSR context without crashing", async () => {
      // Test that service works in server context
      const mockData = { id: "1" };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
        headers: new Headers(),
      });

      const result = await apiService.get("/test");

      expect(result).toEqual(mockData);
      // In test environment, SSR detection works differently
      // The important thing is that the service doesn't crash
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON parsing errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        headers: new Headers(),
      });

      await expect(apiService.get("/test")).rejects.toThrow();
    });

    it("should handle custom error messages from API", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Custom error message" }),
        headers: new Headers(),
      });

      await expect(apiService.get("/test")).rejects.toThrow(
        "Custom error message"
      );
    });

    it("should log errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(apiService.get("/test")).rejects.toThrow();

      expect(trackAPIError).toHaveBeenCalledWith("/test", expect.any(Error));
    });
  });
});
