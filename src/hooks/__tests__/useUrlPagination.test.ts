import { act, renderHook } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUrlPagination } from "../useUrlPagination";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("useUrlPagination Hook", () => {
  const mockPush = jest.fn();
  const mockPathname = "/products";

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (usePathname as jest.Mock).mockReturnValue(mockPathname);

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
      toString: jest.fn().mockReturnValue(""),
    });
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.offset).toBe(0);
      expect(result.current.totalPages).toBe(1);
    });

    it("should initialize with custom values", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          initialPage: 3,
          initialLimit: 50,
          totalItems: 500,
        })
      );

      expect(result.current.page).toBe(3);
      expect(result.current.limit).toBe(50);
      expect(result.current.totalPages).toBe(10);
    });

    it("should read page from URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "5" : null)),
        toString: jest.fn().mockReturnValue("page=5"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.page).toBe(5);
    });

    it("should read limit from URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "limit" ? "100" : null)),
        toString: jest.fn().mockReturnValue("limit=100"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.limit).toBe(100);
    });

    it("should use custom URL param names", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) =>
          key === "p" ? "3" : key === "perPage" ? "25" : null
        ),
        toString: jest.fn().mockReturnValue("p=3&perPage=25"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          pageParam: "p",
          limitParam: "perPage",
        })
      );

      expect(result.current.page).toBe(3);
      expect(result.current.limit).toBe(25);
    });
  });

  describe("Calculations", () => {
    it("should calculate offset correctly", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) =>
          key === "page" ? "3" : key === "limit" ? "20" : null
        ),
        toString: jest.fn().mockReturnValue("page=3&limit=20"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.offset).toBe(40); // (3-1) * 20
    });

    it("should calculate total pages correctly", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 157,
          initialLimit: 20,
        })
      );

      expect(result.current.totalPages).toBe(8); // Math.ceil(157 / 20)
    });

    it("should handle zero total items", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 0,
        })
      );

      expect(result.current.totalPages).toBe(1);
    });

    it("should calculate exact total pages", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 25,
        })
      );

      expect(result.current.totalPages).toBe(4);
    });
  });

  describe("Navigation States", () => {
    it("should detect can go previous", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "3" : null)),
        toString: jest.fn().mockReturnValue("page=3"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.canGoPrev).toBe(true);
    });

    it("should detect cannot go previous on first page", () => {
      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.canGoPrev).toBe(false);
    });

    it("should detect can go next", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      expect(result.current.canGoNext).toBe(true);
    });

    it("should detect cannot go next on last page", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "5" : null)),
        toString: jest.fn().mockReturnValue("page=5"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      expect(result.current.canGoNext).toBe(false);
    });
  });

  describe("Page Navigation", () => {
    it("should set page and update URL", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
        })
      );

      act(() => {
        result.current.setPage(3);
      });

      expect(mockPush).toHaveBeenCalledWith("/products?page=3");
    });

    it("should go to next page", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(mockPush).toHaveBeenCalledWith("/products?page=2");
    });

    it("should not go to next page if on last page", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "5" : null)),
        toString: jest.fn().mockReturnValue("page=5"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should go to previous page", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "3" : null)),
        toString: jest.fn().mockReturnValue("page=3"),
      });

      const { result } = renderHook(() => useUrlPagination());

      act(() => {
        result.current.prevPage();
      });

      expect(mockPush).toHaveBeenCalledWith("/products?page=2");
    });

    it("should not go to previous page if on first page", () => {
      const { result } = renderHook(() => useUrlPagination());

      act(() => {
        result.current.prevPage();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should go to first page", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "5" : null)),
        toString: jest.fn().mockReturnValue("page=5"),
      });

      const { result } = renderHook(() => useUrlPagination());

      act(() => {
        result.current.goToFirstPage();
      });

      expect(mockPush).toHaveBeenCalledWith("/products");
    });

    it("should go to last page", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.goToLastPage();
      });

      expect(mockPush).toHaveBeenCalledWith("/products?page=5");
    });

    it("should not allow invalid page numbers", () => {
      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.setPage(0);
      });

      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        result.current.setPage(10);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Limit Changes", () => {
    it("should set limit and reset to page 1", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "5" : null)),
        toString: jest.fn().mockReturnValue("page=5"),
      });

      const { result } = renderHook(() => useUrlPagination());

      act(() => {
        result.current.setLimit(50);
      });

      expect(mockPush).toHaveBeenCalledWith("/products?limit=50");
    });

    it("should not allow invalid limit", () => {
      const { result } = renderHook(() => useUrlPagination());

      act(() => {
        result.current.setLimit(0);
      });

      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        result.current.setLimit(-10);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should remove default limit from URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "limit" ? "50" : null)),
        toString: jest.fn().mockReturnValue("limit=50"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.setLimit(20);
      });

      expect(mockPush).toHaveBeenCalledWith("/products");
    });
  });

  describe("Reset", () => {
    it("should reset to initial state", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) =>
          key === "page" ? "5" : key === "limit" ? "50" : null
        ),
        toString: jest.fn().mockReturnValue("page=5&limit=50"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          initialPage: 1,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.reset();
      });

      expect(mockPush).toHaveBeenCalledWith("/products");
    });

    it("should reset to custom initial values", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) =>
          key === "page" ? "10" : key === "limit" ? "100" : null
        ),
        toString: jest.fn().mockReturnValue("page=10&limit=100"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          initialPage: 1,
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.reset();
      });

      // Reset removes non-default values
      expect(mockPush).toHaveBeenCalledWith("/products");
    });
  });

  describe("URL Preservation", () => {
    it("should preserve existing query params", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? null : null)),
        toString: jest.fn().mockReturnValue("category=electronics&sort=price"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          totalItems: 100,
        })
      );

      act(() => {
        result.current.setPage(2);
      });

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });

    it("should clean URL when using default values", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "2" : null)),
        toString: jest.fn().mockReturnValue("page=2"),
      });

      const { result } = renderHook(() =>
        useUrlPagination({
          initialPage: 1,
        })
      );

      act(() => {
        result.current.goToFirstPage();
      });

      expect(mockPush).toHaveBeenCalledWith("/products");
    });
  });

  describe("Invalid URL Values", () => {
    it("should fallback to initial page for invalid page in URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "abc" : null)),
        toString: jest.fn().mockReturnValue("page=abc"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.page).toBe(1);
    });

    it("should fallback to initial limit for invalid limit in URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "limit" ? "xyz" : null)),
        toString: jest.fn().mockReturnValue("limit=xyz"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.limit).toBe(20);
    });

    it("should handle negative page in URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "-5" : null)),
        toString: jest.fn().mockReturnValue("page=-5"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.page).toBe(1);
    });

    it("should handle zero page in URL", () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key: string) => (key === "page" ? "0" : null)),
        toString: jest.fn().mockReturnValue("page=0"),
      });

      const { result } = renderHook(() => useUrlPagination());

      expect(result.current.page).toBe(1);
    });
  });
});
