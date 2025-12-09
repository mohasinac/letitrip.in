/**
 * Unit Tests for useResourceList Hook
 *
 * Tests Sieve-style pagination, filtering, sorting, search,
 * and resource list management
 */

import { logError } from "@/lib/firebase-error-logger";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useResourceList } from "../useResourceList";

// Mock dependencies
jest.mock("@/lib/firebase-error-logger");

const mockLogError = logError as jest.MockedFunction<typeof logError>;

interface MockProduct {
  id: string;
  name: string;
  price: number;
}

describe("useResourceList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchUrl).toContain("page=2");
        expect(fetchUrl).toContain("pageSize=10");
        expect(fetchUrl).toContain(
          "filters=category%3D%3Delectronics%2Cstatus%3D%3Dactive"
        );
        expect(fetchUrl).toContain("sorts=-price");
      });
    });

    it("should include additional params in query", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
          additionalParams: { shopId: "shop-123", includeInactive: "true" },
        })
      );

      await waitFor(() => {
        const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
        expect(fetchUrl).toContain("shopId=shop-123");
        expect(fetchUrl).toContain("includeInactive=true");
      });
    });
  });

  describe("Pagination", () => {
    it("should navigate to next page", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalCount: 50,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 2,
              pageSize: 20,
              totalCount: 50,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: true,
            },
          }),
        });

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
      });

      await act(async () => {
        result.current.nextPage();
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2);
      });
    });

    it("should navigate to previous page", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 2,
              pageSize: 20,
              totalCount: 50,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: true,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 1,
              pageSize: 20,
              totalCount: 50,
              totalPages: 3,
              hasNextPage: true,
              hasPreviousPage: false,
            },
          }),
        });

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialPage: 2,
        })
      );

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(2);
      });

      await act(async () => {
        result.current.prevPage();
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
      });
    });

    it("should set specific page", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 5,
              pageSize: 20,
              totalCount: 0,
              totalPages: 0,
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

      await waitFor(() => expect(result.current.pagination.page).toBe(1));

      await act(async () => {
        result.current.setPage(5);
      });

      await waitFor(() => {
        expect(result.current.pagination.page).toBe(5);
      });
    });

    it("should change page size", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [],
            pagination: {
              page: 1,
              pageSize: 50,
              totalCount: 0,
              totalPages: 0,
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

      await waitFor(() => expect(result.current.pagination.pageSize).toBe(20));

      await act(async () => {
        result.current.setPageSize(50);
      });

      await waitFor(() => {
        expect(result.current.pagination.pageSize).toBe(50);
        expect(result.current.pagination.page).toBe(1); // Should reset to page 1
      });
    });
  });

  describe("Filtering", () => {
    it("should set filters", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => expect(result.current.data).toEqual([]));

      await act(async () => {
        result.current.setFilters({ category: "electronics", minPrice: 100 });
      });

      await waitFor(() => {
        expect(result.current.filters).toEqual({
          category: "electronics",
          minPrice: 100,
        });
      });
    });

    it("should update single filter", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialFilters: { status: "active" },
        })
      );

      await waitFor(() =>
        expect(result.current.filters).toEqual({ status: "active" })
      );

      await act(async () => {
        result.current.updateFilter("category", "electronics");
      });

      await waitFor(() => {
        expect(result.current.filters).toEqual({
          status: "active",
          category: "electronics",
        });
      });
    });

    it("should clear all filters", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialFilters: { status: "active", category: "electronics" },
        })
      );

      await waitFor(() =>
        expect(result.current.filters).toHaveProperty("status")
      );

      await act(async () => {
        result.current.clearFilters();
      });

      await waitFor(() => {
        expect(result.current.filters).toEqual({});
      });
    });
  });

  describe("Sorting", () => {
    it("should set sort configuration", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      await act(async () => {
        result.current.setSort({ field: "price", direction: "asc" });
      });

      await waitFor(() => {
        expect(result.current.sort).toEqual({
          field: "price",
          direction: "asc",
        });
      });
    });

    it("should clear sort", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialSort: { field: "name", direction: "desc" },
        })
      );

      await waitFor(() => expect(result.current.sort).toBeTruthy());

      await act(async () => {
        result.current.setSort(null);
      });

      await waitFor(() => {
        expect(result.current.sort).toBeNull();
      });
    });
  });

  describe("Search", () => {
    it("should set search query", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      await act(async () => {
        result.current.setSearch("laptop");
      });

      await waitFor(() => {
        expect(result.current.search).toBe("laptop");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle fetch errors", async () => {
      const error = new Error("Network error");
      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      // Wait for loading to complete first
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // Then check error was set
      expect(result.current.error).toBeTruthy();
      expect(mockLogError).toHaveBeenCalled();
    });

    it("should call onLoadError callback", async () => {
      const error = new Error("API error");
      const onLoadError = jest.fn();

      (global.fetch as jest.Mock).mockRejectedValueOnce(error);

      renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          onLoadError,
        })
      );

      await waitFor(() => {
        expect(onLoadError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("Data Transformation", () => {
    it("should transform data with custom function", async () => {
      const mockData: MockProduct[] = [
        { id: "1", name: "Product 1", price: 100 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockData,
          pagination: {
            page: 1,
            pageSize: 20,
            totalCount: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      });

      const transformData = (data: MockProduct[]) =>
        data.map((item) => ({ ...item, price: item.price * 2 }));

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          transformData,
        })
      );

      await waitFor(() => {
        expect(result.current.data?.[0].price).toBe(200);
      });
    });

    it("should call onLoadSuccess callback", async () => {
      const mockData: MockProduct[] = [];
      const onLoadSuccess = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: mockData,
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
          onLoadSuccess,
        })
      );

      await waitFor(() => {
        expect(onLoadSuccess).toHaveBeenCalledWith(
          mockData,
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe("Loading States", () => {
    it("should set loading state during fetch", async () => {
      let resolvePromise: any;
      const promise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(
        promise.then(() => ({
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
        }))
      );

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolvePromise();
        await promise;
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Manual Reload", () => {
    it("should reload data manually", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [{ id: "1", name: "Old", price: 100 }],
            pagination: {
              page: 1,
              pageSize: 20,
              totalCount: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [{ id: "1", name: "New", price: 150 }],
            pagination: {
              page: 1,
              pageSize: 20,
              totalCount: 1,
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

      await waitFor(() => expect(result.current.data?.[0].name).toBe("Old"));

      await act(async () => {
        await result.current.reload();
      });

      await waitFor(() => {
        expect(result.current.data?.[0].name).toBe("New");
      });
    });
  });

  describe("Reset Functionality", () => {
    it("should reset to initial state", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
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

      const { result } = renderHook(() =>
        useResourceList<MockProduct>({
          endpoint: "/api/products",
          initialPage: 1,
          initialPageSize: 20,
        })
      );

      await waitFor(() => expect(result.current.data).toBeDefined());

      // Make changes
      await act(async () => {
        result.current.setPage(5);
        result.current.setFilters({ status: "active" });
        result.current.setSort({ field: "price", direction: "asc" });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.pagination.page).toBe(1);
      expect(result.current.filters).toEqual({});
      expect(result.current.sort).toBeNull();
    });
  });
});
