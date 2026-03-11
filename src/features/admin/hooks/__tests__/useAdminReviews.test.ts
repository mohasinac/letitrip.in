/**
 * useAdminReviews Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminReviews } from "../useAdminReviews";

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
  reviewService: {
    listAdmin: jest.fn().mockResolvedValue({ reviews: [], meta: {} }),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { reviewService } = require("@/services");

describe("useAdminReviews", () => {
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

  it("calls reviewService.listAdmin with sieveParams", () => {
    renderHook(() => useAdminReviews("page=1"));
    expect(reviewService.listAdmin).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'reviews', sieveParams]", () => {
    renderHook(() => useAdminReviews("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "reviews", "page=1"] }),
    );
  });

  it("updateMutation calls reviewService.update with id and data", () => {
    const { result } = renderHook(() => useAdminReviews(""));
    result.current.updateMutation.mutate({
      id: "rev-1",
      data: { status: "approved" },
    });
    expect(reviewService.update).toHaveBeenCalledWith("rev-1", {
      status: "approved",
    });
  });

  it("deleteMutation calls reviewService.delete with id", () => {
    const { result } = renderHook(() => useAdminReviews(""));
    result.current.deleteMutation.mutate("rev-1");
    expect(reviewService.delete).toHaveBeenCalledWith("rev-1");
  });
});
