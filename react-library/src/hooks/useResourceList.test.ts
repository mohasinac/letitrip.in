/**
 * Unit Tests for useResourceList Hook
 *
 * Tests Sieve-style pagination, filtering, sorting, search,
 * and resource list management
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResourceList } from "./useResourceList";

interface MockProduct {
  id: string;
  name: string;
  price: number;
}

describe("useResourceList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          autoFetch: false,
        })
      );

      expect(result.current.data).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("should use custom initial values", () => {
      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialPage: 2,
          initialPageSize: 50,
          initialFilters: { status: "active" },
          initialSort: { field: "price", direction: "asc" },
          autoFetch: false,
        })
      );

      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.pageSize).toBe(50);
      expect(result.current.filters).toEqual({ status: "active" });
      expect(result.current.sort).toEqual({ field: "price", direction: "asc" });
    });

    it("should auto-fetch on mount by default", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          pagination: {
            page: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      });

      renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should not auto-fetch when disabled", () => {
      renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          autoFetch: false,
        })
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Data Fetching", () => {
    it("should fetch and set data", async () => {
      const mockData: MockProduct[] = [
        { id: "1", name: "Product 1", price: 100 },
        { id: "2", name: "Product 2", price: 200 },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockData,
          pagination: {
            page: 1,
            pageSize: 20,
            totalCount: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      });

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
        expect(result.current.pagination.totalCount).toBe(2);
      });
    });

    it("should build correct query string", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          pagination: {
            page: 2,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        }),
      });

      renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialPage: 2,
          initialPageSize: 10,
          initialFilters: { category: "electronics", status: "active" },
          initialSort: { field: "price", direction: "desc" },
        })
      );

      await waitFor(() => {
        const fetchUrl = (global.fetch as any).mock.calls[0][0];
        expect(fetchUrl).toContain("page=2");
        expect(fetchUrl).toContain("pageSize=10");
        expect(fetchUrl).toContain(
          "filters=category%3D%3Delectronics%2Cstatus%3D%3Dactive"
        );
        expect(fetchUrl).toContain("sorts=-price");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors", async () => {
      const error = new Error("Network error");
      (global.fetch as any).mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });

    it("should call onError callback on error", async () => {
      const onError = vi.fn();
      const error = new Error("Network error");
      (global.fetch as any).mockRejectedValueOnce(error);

      renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          onLoadError: onError,
        })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });
});
