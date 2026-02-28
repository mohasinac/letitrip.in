/**
 * useAdminOrders Tests
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminOrders } from "../useAdminOrders";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return {
      data: {
        orders: [],
        meta: { total: 0, page: 1, pageSize: 25, totalPages: 1 },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listOrders: jest.fn().mockResolvedValue({ orders: [], meta: {} }),
    updateOrder: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return {
        data: {
          orders: [],
          meta: { total: 0, page: 1, pageSize: 25, totalPages: 1 },
        },
        isLoading: false,
        refetch: jest.fn(),
      };
    });
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isLoading: false,
    }));
  });

  it("calls adminService.listOrders with the sieve params", () => {
    const params =
      "?filters=status==pending&sorts=-createdAt&page=1&pageSize=25";
    renderHook(() => useAdminOrders(params));
    expect(adminService.listOrders).toHaveBeenCalledWith(params);
  });

  it("uses queryKey ['admin', 'orders', sieveParams]", () => {
    const params = "?sorts=-createdAt";
    renderHook(() => useAdminOrders(params));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "orders", params] }),
    );
  });

  it("returns updateMutation that calls adminService.updateOrder", () => {
    const { result } = renderHook(() => useAdminOrders(""));
    result.current.updateMutation.mutate({
      id: "order-123",
      data: { status: "shipped" },
    });
    expect(adminService.updateOrder).toHaveBeenCalledWith("order-123", {
      status: "shipped",
    });
  });

  it("returns orders from data", () => {
    const mockOrders = [{ id: "order-1", status: "pending" }];
    (useApiQuery as jest.Mock).mockReturnValueOnce({
      data: { orders: mockOrders, meta: {} },
      isLoading: false,
    });
    const { result } = renderHook(() => useAdminOrders(""));
    expect(result.current.data?.orders).toEqual(mockOrders);
  });

  it("returns isLoading state", () => {
    (useApiQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isLoading: true,
    });
    const { result } = renderHook(() => useAdminOrders(""));
    expect(result.current.isLoading).toBe(true);
  });
});
