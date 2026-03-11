/**
 * useAdminAnalytics Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminAnalytics } from "../useAdminAnalytics";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  adminService: {
    getAnalytics: jest.fn().mockResolvedValue({ data: null }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { adminService } = require("@/services");

describe("useAdminAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.getAnalytics via queryFn", () => {
    renderHook(() => useAdminAnalytics());
    expect(adminService.getAnalytics).toHaveBeenCalled();
  });

  it("uses queryKey ['admin-analytics']", () => {
    renderHook(() => useAdminAnalytics());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin-analytics"] }),
    );
  });
});
