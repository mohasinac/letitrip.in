/**
 * useCategorySelector Tests
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

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn((opts: any) => {
    opts.queryFn?.();
    return {
      data: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: (data: any) => opts.mutationFn(data),
    mutateAsync: (data: any) => opts.mutationFn(data),
    isPending: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  categoryService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
}));

jest.mock("@/actions", () => ({
  createCategoryAction: jest.fn().mockResolvedValue({ id: "cat-1" }),
}));

const { useQuery, useMutation } = require("@tanstack/react-query");
const { categoryService } = require("@/services");
const { createCategoryAction } = require("@/actions");

describe("useCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn?.();
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
    expect(useQuery).toHaveBeenCalledWith(
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
    (useQuery as jest.Mock).mockReturnValue({
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
    (useQuery as jest.Mock).mockReturnValue({
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

  it("calls createCategoryAction when mutation is invoked", () => {
    const { result } = renderHook(() => useCreateCategory());
    result.current.mutate({ name: "New Category", slug: "new-category" });
    expect(createCategoryAction).toHaveBeenCalledWith({
      name: "New Category",
      slug: "new-category",
    });
  });

  it("wires onSuccess callback through useMutation", () => {
    const onSuccess = jest.fn();
    renderHook(() => useCreateCategory({ onSuccess }));
    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("wires onError callback through useMutation", () => {
    const onError = jest.fn();
    renderHook(() => useCreateCategory({ onError }));
    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });
});

describe("useCategorySelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn?.();
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

  it("calls createCategoryAction when createCategory is invoked", () => {
    const { result } = renderHook(() => useCategorySelector());
    result.current.createCategory({ name: "Cat A" });
    expect(createCategoryAction).toHaveBeenCalledWith({ name: "Cat A" });
  });
});
