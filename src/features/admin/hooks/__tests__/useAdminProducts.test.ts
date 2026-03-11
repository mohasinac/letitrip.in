/**
 * useAdminProducts Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminProducts } from "../useAdminProducts";

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
  adminService: {
    listAdminProducts: jest.fn().mockResolvedValue({ products: [], meta: {} }),
  },
}));

jest.mock("@/actions", () => ({
  adminCreateProductAction: jest.fn().mockResolvedValue({}),
  adminUpdateProductAction: jest.fn().mockResolvedValue({}),
  adminDeleteProductAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");
const {
  adminCreateProductAction,
  adminDeleteProductAction,
} = require("@/actions");

describe("useAdminProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.listAdminProducts with sieveParams", () => {
    renderHook(() => useAdminProducts("page=1"));
    expect(adminService.listAdminProducts).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'products', sieveParams]", () => {
    renderHook(() => useAdminProducts("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "products", "page=1"] }),
    );
  });

  it("createMutation calls adminCreateProductAction", () => {
    const { result } = renderHook(() => useAdminProducts(""));
    result.current.createMutation.mutate({ title: "New Product" });
    expect(adminCreateProductAction).toHaveBeenCalledWith({
      title: "New Product",
    });
  });

  it("deleteMutation calls adminDeleteProductAction with id", () => {
    const { result } = renderHook(() => useAdminProducts(""));
    result.current.deleteMutation.mutate("prod-1");
    expect(adminDeleteProductAction).toHaveBeenCalledWith("prod-1");
  });
});
