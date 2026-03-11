/**
 * useAdminBids Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminBids } from "../useAdminBids";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  adminService: {
    listBids: jest.fn().mockResolvedValue({ bids: [], meta: {} }),
  },
}));

const { useQuery } = require("@tanstack/react-query");
const { adminService } = require("@/services");

describe("useAdminBids", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls adminService.listBids with sieveParams", () => {
    renderHook(() => useAdminBids("page=1"));
    expect(adminService.listBids).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'bids', sieveParams]", () => {
    renderHook(() => useAdminBids("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "bids", "page=1"] }),
    );
  });
});
