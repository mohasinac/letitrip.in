/**
 * useUserOrders Tests — Phase 62
 *
 * Verifies that useUserOrders delegates to orderService.list()
 * and only fetches when the user is authenticated.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useUserOrders } from "../useUserOrders";

const mockUser = { uid: "user-1", email: "user@example.com" };

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    if (opts.enabled !== false) opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useAuth: jest.fn(() => ({ user: mockUser, loading: false })),
}));

jest.mock("@/services", () => ({
  orderService: {
    list: jest
      .fn()
      .mockResolvedValue({ orders: [], total: 0, page: 1, totalPages: 0 }),
  },
}));

const { useApiQuery, useAuth } = require("@/hooks");
const { orderService } = require("@/services");

describe("useUserOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.enabled !== false) opts.queryFn();
      return { data: null, isLoading: false, error: null, refetch: jest.fn() };
    });
  });

  it("calls orderService.list when user is authenticated", () => {
    renderHook(() => useUserOrders());
    expect(orderService.list).toHaveBeenCalledWith(undefined);
  });

  it("calls orderService.list with params string", () => {
    renderHook(() => useUserOrders("status=delivered"));
    expect(orderService.list).toHaveBeenCalledWith("status=delivered");
  });

  it("uses queryKey ['user-orders', ''] when no params", () => {
    renderHook(() => useUserOrders());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["user-orders", ""] }),
    );
  });

  it("does NOT call orderService.list when user is null", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    renderHook(() => useUserOrders());
    expect(orderService.list).not.toHaveBeenCalled();
  });

  it("does NOT call orderService.list while auth is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    renderHook(() => useUserOrders());
    expect(orderService.list).not.toHaveBeenCalled();
  });

  it("returns empty orders and default totals when data is null", () => {
    const { result } = renderHook(() => useUserOrders());
    expect(result.current.orders).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });
});
