import { renderHook } from "@testing-library/react";
import { useProfileStats } from "../useProfileStats";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(),
}));

jest.mock("@/services", () => ({
  orderService: { list: jest.fn() },
  addressService: { list: jest.fn() },
}));

import { useApiQuery } from "@/hooks";
const mockUseApiQuery = useApiQuery as jest.Mock;

describe("useProfileStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns zero counts and isLoading=false when data is undefined", () => {
    mockUseApiQuery.mockReturnValue({ data: undefined, isLoading: false });
    const { result } = renderHook(() => useProfileStats(true));
    expect(result.current.orderCount).toBe(0);
    expect(result.current.addressCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns order count from data.data.total", () => {
    mockUseApiQuery
      .mockReturnValueOnce({
        data: { data: { total: 7 } },
        isLoading: false,
      })
      .mockReturnValueOnce({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useProfileStats(true));
    expect(result.current.orderCount).toBe(7);
  });

  it("returns address count from data.data array length", () => {
    mockUseApiQuery
      .mockReturnValueOnce({ data: undefined, isLoading: false })
      .mockReturnValueOnce({
        data: { data: [{}, {}] },
        isLoading: false,
      });

    const { result } = renderHook(() => useProfileStats(true));
    expect(result.current.addressCount).toBe(2);
  });

  it("returns isLoading=true when either query is loading", () => {
    mockUseApiQuery
      .mockReturnValueOnce({ data: undefined, isLoading: true })
      .mockReturnValueOnce({ data: undefined, isLoading: false });

    const { result } = renderHook(() => useProfileStats(true));
    expect(result.current.isLoading).toBe(true);
  });

  it("passes enabled=false to both queries when disabled", () => {
    mockUseApiQuery.mockReturnValue({ data: undefined, isLoading: false });
    renderHook(() => useProfileStats(false));
    // Both calls should have enabled=false
    const calls = mockUseApiQuery.mock.calls;
    expect(calls[0][0].enabled).toBe(false);
    expect(calls[1][0].enabled).toBe(false);
  });
});
