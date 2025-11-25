/// <reference types="@testing-library/jest-dom" />

import { renderHook, act } from "@testing-library/react";
import { useFilters } from "./useFilters";

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = "/test";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: jest.fn(),
}));

describe("useFilters", () => {
  beforeEach(() => {
    mockPush.mockClear();
    // Mock localStorage
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it("initializes with initial filters", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() => useFilters(initialFilters));

    expect(result.current.filters).toEqual(initialFilters);
    expect(result.current.appliedFilters).toEqual(initialFilters);
    expect(result.current.hasActiveFilters).toBe(true); // price: 0 counts as active
    expect(result.current.activeFilterCount).toBe(1); // price: 0 is active
  });

  it("loads filters from URL", () => {
    const mockSearchParams = new URLSearchParams(
      'category="electronics"&price=200'
    );
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, { syncWithUrl: true })
    );

    expect(result.current.filters).toEqual({
      category: "electronics",
      price: 200,
    });
    expect(result.current.appliedFilters).toEqual({
      category: "electronics",
      price: 200,
    });
  });

  it("loads filters from localStorage when persist is enabled", () => {
    (global.localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ category: "books", price: 50 })
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, { persist: true, storageKey: "test-filters" })
    );

    expect(result.current.filters).toEqual({ category: "books", price: 50 });
    expect(result.current.appliedFilters).toEqual({
      category: "books",
      price: 50,
    });
  });

  it("updates filters", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() => useFilters(initialFilters));

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
    });

    expect(result.current.filters).toEqual({
      category: "electronics",
      price: 200,
    });
    expect(result.current.appliedFilters).toEqual(initialFilters); // Not applied yet
  });

  it("applies filters and syncs to URL", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, { syncWithUrl: true })
    );

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(result.current.appliedFilters).toEqual({
      category: "electronics",
      price: 200,
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/test?category=%22electronics%22&price=200",
      { scroll: false }
    );
  });

  it("persists filters to localStorage", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, { persist: true, storageKey: "test-filters" })
    );

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
      result.current.applyFilters();
    });

    expect(mockPush).toHaveBeenCalledWith(
      "/test?category=%22electronics%22&price=200",
      { scroll: false }
    );
  });

  it("resets filters", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, {
        syncWithUrl: true,
        persist: true,
        storageKey: "test-filters",
      })
    );

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
      result.current.applyFilters();
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual(initialFilters);
    expect(result.current.appliedFilters).toEqual(initialFilters);
    expect(mockPush).toHaveBeenLastCalledWith("/test?price=0", {
      scroll: false,
    });
    expect(global.localStorage.setItem as jest.Mock).toHaveBeenCalledWith(
      "test-filters",
      JSON.stringify({ category: "electronics", price: 200 })
    );
  });

  it("clears a specific filter", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() => useFilters(initialFilters));

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
    });

    act(() => {
      result.current.clearFilter("price");
    });

    expect(result.current.filters).toEqual({ category: "electronics" });
  });

  it("calculates active filter count", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const initialFilters = { category: "", price: 0, tags: [] as string[] };
    const { result } = renderHook(() => useFilters(initialFilters));

    act(() => {
      result.current.updateFilters({
        category: "electronics",
        price: 0,
        tags: ["new"],
      });
      result.current.applyFilters();
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.activeFilterCount).toBe(3); // category, price, tags
  });

  it("calls onChange callback when filters are applied", () => {
    const mockSearchParams = new URLSearchParams();
    (require("next/navigation").useSearchParams as jest.Mock).mockReturnValue(
      mockSearchParams
    );

    const onChange = jest.fn();
    const initialFilters = { category: "", price: 0 };
    const { result } = renderHook(() =>
      useFilters(initialFilters, { onChange })
    );

    act(() => {
      result.current.updateFilters({ category: "electronics", price: 200 });
      result.current.applyFilters();
    });

    expect(onChange).toHaveBeenCalledWith({
      category: "electronics",
      price: 200,
    });
  });
});
