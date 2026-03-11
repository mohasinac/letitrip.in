/**
 * useAdminAnalytics Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminAnalytics } from "../useAdminAnalytics";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    getAnalytics: jest.fn().mockResolvedValue({ data: null }),
  },
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");

describe("useAdminAnalytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
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
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin-analytics"] }),
    );
  });
});
