import { act, renderHook } from "@testing-library/react";
import { useUrlPagination } from "./useUrlPagination";

// Mock Next.js navigation
const mockPush = jest.fn();
const mockPathname = "/test";
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

describe("useUrlPagination", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams.delete("page");
    mockSearchParams.delete("limit");
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useUrlPagination());

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(20);
    expect(result.current.offset).toBe(0);
  });

  it("calculates offset correctly", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 3, initialLimit: 10 }),
    );

    expect(result.current.offset).toBe(20); // (3-1) * 10
  });

  it("calculates total pages correctly", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialLimit: 10, totalItems: 95 }),
    );

    expect(result.current.totalPages).toBe(10); // Math.ceil(95/10)
  });

  it("checks navigation availability", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 2, totalItems: 100, initialLimit: 20 }),
    );

    expect(result.current.canGoPrev).toBe(true);
    expect(result.current.canGoNext).toBe(true);
  });

  it("prevents navigation beyond bounds", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 1, totalItems: 20, initialLimit: 20 }),
    );

    expect(result.current.canGoPrev).toBe(false);
    expect(result.current.canGoNext).toBe(false);
  });

  it("updates page via setPage", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ totalItems: 100, initialLimit: 20 }),
    );

    act(() => {
      result.current.setPage(3);
    });

    expect(mockPush).toHaveBeenCalledWith("/test?page=3");
  });

  it("updates limit via setLimit and resets to page 1", () => {
    const { result } = renderHook(() => useUrlPagination());

    act(() => {
      result.current.setLimit(50);
    });

    expect(mockPush).toHaveBeenCalledWith("/test?limit=50");
  });

  it("navigates to next page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 2, totalItems: 100, initialLimit: 20 }),
    );

    act(() => {
      result.current.nextPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/test?page=3");
  });

  it("navigates to previous page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 2, totalItems: 100, initialLimit: 20 }),
    );

    act(() => {
      result.current.prevPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/test");
  });

  it("navigates to first page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 3, totalItems: 100, initialLimit: 20 }),
    );

    act(() => {
      result.current.goToFirstPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/test");
  });

  it("navigates to last page", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 1, totalItems: 100, initialLimit: 20 }),
    );

    act(() => {
      result.current.goToLastPage();
    });

    expect(mockPush).toHaveBeenCalledWith("/test?page=5");
  });

  it("resets to initial state", () => {
    const { result } = renderHook(() =>
      useUrlPagination({ initialPage: 1, initialLimit: 20 }),
    );

    act(() => {
      result.current.setPage(5);
    });

    act(() => {
      result.current.reset();
    });

    expect(mockPush).toHaveBeenLastCalledWith("/test");
  });
});
