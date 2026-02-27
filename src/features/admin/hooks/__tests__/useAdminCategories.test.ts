/**
 * useAdminCategories Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCategories } from "../useAdminCategories";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  categoryService: {
    list: jest.fn().mockResolvedValue({ categories: [] }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { categoryService } = require("@/services");

describe("useAdminCategories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
    }));
  });

  it("calls categoryService.list with 'view=tree'", () => {
    renderHook(() => useAdminCategories());
    expect(categoryService.list).toHaveBeenCalledWith("view=tree");
  });

  it("uses queryKey ['categories', 'tree']", () => {
    renderHook(() => useAdminCategories());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["categories", "tree"] }),
    );
  });

  it("createMutation calls categoryService.create", () => {
    const { result } = renderHook(() => useAdminCategories());
    result.current.createMutation.mutate({ name: "Shoes" });
    expect(categoryService.create).toHaveBeenCalledWith({ name: "Shoes" });
  });

  it("deleteMutation calls categoryService.delete with id", () => {
    const { result } = renderHook(() => useAdminCategories());
    result.current.deleteMutation.mutate("cat-1");
    expect(categoryService.delete).toHaveBeenCalledWith("cat-1");
  });
});
