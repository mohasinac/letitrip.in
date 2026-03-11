/**
 * useOrderDetail Tests — Phase 62
 *
 * Verifies that useOrderDetail delegates to orderService.getById()
 * and only fetches when the user is authenticated and id is provided.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useOrderDetail } from "../useOrderDetail";

const mockUser = { uid: "user-1", email: "user@example.com" };

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
  orderService: {
    getById: jest.fn().mockResolvedValue({ data: null }),
  },
}));

const { useApiQuery, useAuth } = require("@/hooks");
const { orderService } = require("@/services");

describe("useOrderDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, loading: false });
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.enabled !== false) opts.queryFn();
      return { data: null, isLoading: false, error: null, refetch: jest.fn() };
    });
  });

  it("calls orderService.getById with the order id", () => {
    renderHook(() => useOrderDetail("order-1"));
    expect(orderService.getById).toHaveBeenCalledWith("order-1");
  });

  it("uses queryKey ['user-order', id]", () => {
    renderHook(() => useOrderDetail("order-1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["user-order", "order-1"] }),
    );
  });

  it("does NOT fetch when user is null", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    renderHook(() => useOrderDetail("order-1"));
    expect(orderService.getById).not.toHaveBeenCalled();
  });

  it("does NOT fetch while auth is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    renderHook(() => useOrderDetail("order-1"));
    expect(orderService.getById).not.toHaveBeenCalled();
  });

  it("returns null order when data is null", () => {
    const { result } = renderHook(() => useOrderDetail("order-1"));
    expect(result.current.order).toBeNull();
  });

  it("extracts order from data.data", () => {
    const mockOrder = { id: "order-1", status: "delivered" };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { data: mockOrder },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useOrderDetail("order-1"));
    expect(result.current.order).toEqual(mockOrder);
  });
});
