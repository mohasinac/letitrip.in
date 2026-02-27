/**
 * useCategorySelector Tests — Phase 62
 *
 * Covers three exports from useCategorySelector.ts:
 * - useCategorySelector (composite: list query + create mutation)
 * - useCategories (list query only)
 * - useCreateCategory (create mutation only)
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import {
  useCategorySelector,
  useCategories,
  useCreateCategory,
} from "../useCategorySelector";

const mockRefetch = jest.fn();

jest.mock("../useApiQuery", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

jest.mock("../useApiMutation", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: any) => opts.mutationFn(data),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  categoryService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    create: jest.fn().mockResolvedValue({ id: "cat-1" }),
  },
}));

const { useApiQuery } = require("../useApiQuery");
const { useApiMutation } = require("../useApiMutation");
const { categoryService } = require("@/services");

describe("useCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return {
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      };
    });
  });

  it("queries categoryService.list with queryKey ['categories']", () => {
    renderHook(() => useCategories());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["categories"] }),
    );
    expect(categoryService.list).toHaveBeenCalled();
  });

  it("returns empty categories array when data is null", () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.categories).toEqual([]);
  });

  it("normalises data.data array", () => {
    const cats = [{ id: "c1", name: "Electronics", slug: "electronics" }];
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { data: cats },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useCategories());
    expect(result.current.categories).toEqual(cats);
  });

  it("normalises data.items as fallback", () => {
    const cats = [{ id: "c2", name: "Fashion", slug: "fashion" }];
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { items: cats },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useCategories());
    expect(result.current.categories).toEqual(cats);
  });
});

describe("useCreateCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls categoryService.create when mutation is invoked", () => {
    const { result } = renderHook(() => useCreateCategory());
    result.current.mutate({ name: "New Category", slug: "new-category" });
    expect(categoryService.create).toHaveBeenCalledWith({
      name: "New Category",
      slug: "new-category",
    });
  });

  it("wires onSuccess callback through useApiMutation", () => {
    const onSuccess = jest.fn();
    renderHook(() => useCreateCategory({ onSuccess }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("wires onError callback through useApiMutation", () => {
    const onError = jest.fn();
    renderHook(() => useCreateCategory({ onError }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });
});

describe("useCategorySelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return {
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      };
    });
  });

  it("queries categories and exposes createCategory mutation", () => {
    const { result } = renderHook(() => useCategorySelector());
    expect(result.current.categories).toEqual([]);
    expect(typeof result.current.createCategory).toBe("function");
  });

  it("calls categoryService.create when createCategory is invoked", () => {
    const { result } = renderHook(() => useCategorySelector());
    result.current.createCategory({ name: "Cat A" });
    expect(categoryService.create).toHaveBeenCalledWith({ name: "Cat A" });
  });
});
