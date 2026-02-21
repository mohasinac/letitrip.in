/**
 * useUrlTable Tests — Phase 2
 *
 * Verifies URL-driven table state management:
 * - set() resets page except for page/pageSize/view
 * - setMany() batches navigation
 * - buildSieveParams() / buildSearchParams() produce correct query strings
 * - clear() removes specified keys
 * - getNumber() returns numeric values with fallback
 */

import { renderHook, act } from "@testing-library/react";

// --- Mock next/navigation ---
const mockReplace = jest.fn();
let mockSearchParamsMap: Map<string, string> = new Map();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/admin/products",
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsMap.get(key) ?? null,
    toString: () => {
      const p = new URLSearchParams();
      mockSearchParamsMap.forEach((v, k) => p.set(k, v));
      return p.toString();
    },
  }),
}));

// After mocking, import the hook
import { useUrlTable } from "../useUrlTable";

// Helper to reset between tests
beforeEach(() => {
  mockReplace.mockClear();
  mockSearchParamsMap = new Map();
});

// Helper: pull query string from latest replace() call
const getLastParams = () => {
  const url: string =
    mockReplace.mock.calls[mockReplace.mock.calls.length - 1][0];
  return new URLSearchParams(url.split("?")[1] ?? "");
};

describe("useUrlTable", () => {
  it("set(key, val) updates the param and resets page to '1'", () => {
    mockSearchParamsMap = new Map([["page", "3"]]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.set("status", "active");
    });

    const p = getLastParams();
    expect(p.get("status")).toBe("active");
    expect(p.get("page")).toBe("1");
  });

  it("set('page', val) does NOT reset page — only changes page", () => {
    mockSearchParamsMap = new Map([["status", "active"]]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.set("page", "5");
    });

    const p = getLastParams();
    expect(p.get("page")).toBe("5");
    expect(p.get("status")).toBe("active");
  });

  it("set('pageSize', val) does NOT reset page", () => {
    mockSearchParamsMap = new Map([["page", "3"]]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.set("pageSize", "50");
    });

    const p = getLastParams();
    expect(p.get("pageSize")).toBe("50");
    expect(p.get("page")).toBe("3"); // unchanged
  });

  it("set('view', val) does NOT reset page — view toggle is non-destructive", () => {
    mockSearchParamsMap = new Map([
      ["page", "2"],
      ["status", "active"],
    ]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.set("view", "grid");
    });

    const p = getLastParams();
    expect(p.get("view")).toBe("grid");
    expect(p.get("page")).toBe("2"); // unchanged
  });

  it("setMany({ a, b }) batches into a single router.replace() call", () => {
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.setMany({ status: "active", role: "seller" });
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const p = getLastParams();
    expect(p.get("status")).toBe("active");
    expect(p.get("role")).toBe("seller");
    expect(p.get("page")).toBe("1");
  });

  it("setSort(val) resets page to '1'", () => {
    mockSearchParamsMap = new Map([["page", "4"]]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.setSort("-price");
    });

    const p = getLastParams();
    expect(p.get("sort")).toBe("-price");
    expect(p.get("page")).toBe("1");
  });

  it("buildSieveParams() returns correct format", () => {
    mockSearchParamsMap = new Map([
      ["page", "2"],
      ["pageSize", "25"],
      ["sort", "-createdAt"],
    ]);
    const { result } = renderHook(() => useUrlTable());

    const qs = result.current.buildSieveParams("status==published,price>=100");
    const p = new URLSearchParams(qs.slice(1)); // remove leading '?'
    expect(p.get("filters")).toBe("status==published,price>=100");
    expect(p.get("sorts")).toBe("-createdAt");
    expect(p.get("page")).toBe("2");
    expect(p.get("pageSize")).toBe("25");
  });

  it("buildSieveParams() uses defaults when params absent", () => {
    const { result } = renderHook(() =>
      useUrlTable({ defaults: { pageSize: "50", sort: "-title" } }),
    );

    const qs = result.current.buildSieveParams("");
    const p = new URLSearchParams(qs.slice(1));
    expect(p.get("sorts")).toBe("-title");
    expect(p.get("pageSize")).toBe("50");
  });

  it("buildSearchParams() returns correct named-param query string", () => {
    mockSearchParamsMap = new Map([
      ["q", "shoes"],
      ["category", "footwear"],
    ]);
    const { result } = renderHook(() =>
      useUrlTable({ defaults: { sort: "-createdAt", pageSize: "24" } }),
    );

    const qs = result.current.buildSearchParams();
    const p = new URLSearchParams(qs.slice(1));
    expect(p.get("q")).toBe("shoes");
    expect(p.get("category")).toBe("footwear");
    expect(p.get("sort")).toBe("-createdAt");
    expect(p.get("pageSize")).toBe("24");
  });

  it("clear(keys) removes only specified keys and resets page", () => {
    mockSearchParamsMap = new Map([
      ["status", "active"],
      ["role", "seller"],
      ["page", "3"],
    ]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.clear(["status"]);
    });

    const p = getLastParams();
    expect(p.get("status")).toBeNull();
    expect(p.get("role")).toBe("seller");
    expect(p.get("page")).toBe("1");
  });

  it("clear() with no args removes all params (replaces to pathname)", () => {
    mockSearchParamsMap = new Map([["status", "active"]]);
    const { result } = renderHook(() => useUrlTable());

    act(() => {
      result.current.clear();
    });

    expect(mockReplace).toHaveBeenCalledWith("/admin/products");
  });

  it("getNumber(key, default) returns number; falls back when param absent", () => {
    mockSearchParamsMap = new Map([["page", "5"]]);
    const { result } = renderHook(() => useUrlTable());

    expect(result.current.getNumber("page", 1)).toBe(5);
    expect(result.current.getNumber("missing", 99)).toBe(99);
  });
});
