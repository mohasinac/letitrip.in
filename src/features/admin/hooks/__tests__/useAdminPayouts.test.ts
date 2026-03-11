/**
 * useAdminPayouts Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminPayouts } from "../useAdminPayouts";

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
    listPayouts: jest.fn().mockResolvedValue({ payouts: [] }),
  },
}));

jest.mock("@/actions", () => ({
  adminUpdatePayoutAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");
const { adminUpdatePayoutAction } = require("@/actions");

describe("useAdminPayouts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.listPayouts with sieve query string", () => {
    renderHook(() =>
      useAdminPayouts("filters=status%3D%3Dpending&sorts=-createdAt"),
    );
    expect(adminService.listPayouts).toHaveBeenCalled();
  });

  it("uses queryKey ['admin', 'payouts', sieveParams]", () => {
    renderHook(() => useAdminPayouts("filters=status%3D%3Dpending"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["admin", "payouts", "filters=status%3D%3Dpending"],
      }),
    );
  });

  it("updateMutation calls adminUpdatePayoutAction with id and data", () => {
    const { result } = renderHook(() => useAdminPayouts(""));
    result.current.updateMutation.mutate({
      id: "pay-1",
      data: { status: "approved" },
    });
    expect(adminUpdatePayoutAction).toHaveBeenCalledWith("pay-1", {
      status: "approved",
    });
  });
});
