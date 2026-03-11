/**
 * useAdminCategories Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCategories } from "../useAdminCategories";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  categoryService: {
    list: jest.fn().mockResolvedValue({ categories: [] }),
  },
}));

jest.mock("@/actions", () => ({
  createCategoryAction: jest.fn().mockResolvedValue({}),
  updateCategoryAction: jest.fn().mockResolvedValue({}),
  deleteCategoryAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { categoryService } = require("@/services");
const { createCategoryAction, deleteCategoryAction } = require("@/actions");

describe("useAdminCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls categoryService.list with 'view=tree'", () => {
    renderHook(() => useAdminCategories());
    expect(categoryService.list).toHaveBeenCalledWith("view=tree");
  });

  it("uses queryKey ['categories', 'tree']", () => {
    renderHook(() => useAdminCategories());
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["categories", "tree"] }),
    );
  });

  it("createMutation calls createCategoryAction", () => {
    const { result } = renderHook(() => useAdminCategories());
    result.current.createMutation.mutate({ name: "Shoes" });
    expect(createCategoryAction).toHaveBeenCalledWith({ name: "Shoes" });
  });

  it("deleteMutation calls deleteCategoryAction with id", () => {
    const { result } = renderHook(() => useAdminCategories());
    result.current.deleteMutation.mutate("cat-1");
    expect(deleteCategoryAction).toHaveBeenCalledWith("cat-1");
  });
});
