/**
 * API Service Tests
 *
 * Tests for the apiService singleton which handles HTTP requests,
 * caching, request deduplication, and error handling.
 */

// Mock fetch globally before importing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock analytics
jest.mock("@/lib/analytics", () => ({
  trackSlowAPI: jest.fn(),
  trackAPIError: jest.fn(),
  trackCacheHit: jest.fn(),
}));

// Mock cache config
jest.mock("@/config/cache.config", () => ({
  DEFAULT_CACHE_CONFIG: {
    "/categories": { ttl: 300000, staleWhileRevalidate: 600000 },
    "/products": { ttl: 60000, staleWhileRevalidate: 120000 },
  },
}));

// Import after mocks
import { apiService } from "../api.service";
import { trackSlowAPI, trackAPIError, trackCacheHit } from "@/lib/analytics";

describe("apiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should make GET request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      const result = await apiService.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(result).toEqual({ data: "test" });
    });

    it("should handle query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await apiService.get("/products?page=1&limit=20");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/products?page=1&limit=20",
        expect.anything(),
      );
    });

    it("should throw on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: "Not found" }),
      });

      await expect(apiService.get("/notfound")).rejects.toThrow();
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(apiService.get("/test")).rejects.toThrow("Network error");
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "1" }),
      });

      const result = await apiService.post("/items", { name: "Test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/items",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "Test" }),
        }),
      );
      expect(result).toEqual({ id: "1" });
    });

    it("should set content-type header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await apiService.post("/items", { name: "Test" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });
  });

  describe("patch", () => {
    it("should make PATCH request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      });

      const result = await apiService.patch("/items/1", { name: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/items/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Updated" }),
        }),
      );
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      });

      const result = await apiService.delete("/items/1");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/items/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should track API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Server error" }),
      });

      await expect(apiService.get("/error")).rejects.toThrow();

      expect(trackAPIError).toHaveBeenCalled();
    });
  });
});
