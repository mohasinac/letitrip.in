/**
 * useSellerOrders Tests — Phase 62
 *
 * Verifies that useSellerOrders delegates to sellerService.listOrders()
 * and only fetches when the seller is authenticated.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useSellerOrders } from "../useSellerOrders";

const mockUser = { uid: "seller-1", email: "seller@example.com" };

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn((opts: any) => {
    if (opts.enabled !== false) opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useAuth: jest.fn(() => ({ user: mockUser, loading: false })),
}));

jest.mock("@/services", () => ({
  sellerService: {
    listOrders: jest.fn().mockResolvedValue({ orders: [], meta: {} }),
  },
}));

const { useApiQuery, useAuth } = require("@/hooks");
const { sellerService } = require("@/services");

describe("useSellerOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.enabled !== false) opts.queryFn();
      return { data: null, isLoading: false, error: null, refetch: jest.fn() };
    });
  });

  it("calls sellerService.listOrders with the provided params", () => {
    renderHook(() => useSellerOrders("page=1&pageSize=25"));
    expect(sellerService.listOrders).toHaveBeenCalledWith("page=1&pageSize=25");
  });

  it("uses queryKey ['seller-orders', params]", () => {
    renderHook(() => useSellerOrders("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["seller-orders", "page=1"] }),
    );
  });

  it("uses queryKey ['seller-orders', ''] when params is undefined", () => {
    renderHook(() => useSellerOrders());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["seller-orders", ""] }),
    );
  });

  it("does NOT fetch when user is null", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    renderHook(() => useSellerOrders());
    expect(sellerService.listOrders).not.toHaveBeenCalled();
  });

  it("does NOT fetch while auth is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    renderHook(() => useSellerOrders());
    expect(sellerService.listOrders).not.toHaveBeenCalled();
  });

  it("returns orders array from data", () => {
    const mockOrders = [{ id: "o-1" }, { id: "o-2" }];
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { orders: mockOrders, meta: { total: 2 } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useSellerOrders());
    expect(result.current.orders).toEqual(mockOrders);
  });
});
