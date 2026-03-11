/**
 * useAdminPayouts Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminPayouts } from "../useAdminPayouts";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
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
    listPayouts: jest.fn().mockResolvedValue({ payouts: [] }),
    updatePayout: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminPayouts", () => {
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

  it("calls adminService.listPayouts with sieve query string", () => {
    renderHook(() =>
      useAdminPayouts("filters=status%3D%3Dpending&sorts=-createdAt"),
    );
    expect(adminService.listPayouts).toHaveBeenCalled();
  });

  it("uses queryKey ['admin', 'payouts', sieveParams]", () => {
    renderHook(() => useAdminPayouts("filters=status%3D%3Dpending"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["admin", "payouts", "filters=status%3D%3Dpending"],
      }),
    );
  });

  it("updateMutation calls adminService.updatePayout", () => {
    const { result } = renderHook(() => useAdminPayouts(""));
    result.current.updateMutation.mutate({
      id: "pay-1",
      data: { status: "approved" },
    });
    expect(adminService.updatePayout).toHaveBeenCalledWith("pay-1", {
      status: "approved",
    });
  });
});
