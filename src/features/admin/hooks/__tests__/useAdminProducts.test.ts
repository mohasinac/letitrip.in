/**
 * useAdminProducts Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminProducts } from "../useAdminProducts";

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
  adminService: {
    listAdminProducts: jest.fn().mockResolvedValue({ products: [], meta: {} }),
    createAdminProduct: jest.fn().mockResolvedValue({}),
    updateAdminProduct: jest.fn().mockResolvedValue({}),
    deleteAdminProduct: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminProducts", () => {
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

  it("calls adminService.listAdminProducts with sieveParams", () => {
    renderHook(() => useAdminProducts("page=1"));
    expect(adminService.listAdminProducts).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'products', sieveParams]", () => {
    renderHook(() => useAdminProducts("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "products", "page=1"] }),
    );
  });

  it("createMutation calls adminService.createAdminProduct", () => {
    const { result } = renderHook(() => useAdminProducts(""));
    result.current.createMutation.mutate({ title: "New Product" });
    expect(adminService.createAdminProduct).toHaveBeenCalledWith({
      title: "New Product",
    });
  });

  it("deleteMutation calls adminService.deleteAdminProduct with id", () => {
    const { result } = renderHook(() => useAdminProducts(""));
    result.current.deleteMutation.mutate("prod-1");
    expect(adminService.deleteAdminProduct).toHaveBeenCalledWith("prod-1");
  });
});
