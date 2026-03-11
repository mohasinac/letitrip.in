/**
 * useAdminReviews Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminReviews } from "../useAdminReviews";

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
  reviewService: {
    listAdmin: jest.fn().mockResolvedValue({ reviews: [], meta: {} }),
  },
}));

jest.mock("@/actions", () => ({
  adminUpdateReviewAction: jest.fn().mockResolvedValue({}),
  adminDeleteReviewAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { reviewService } = require("@/services");
const {
  adminUpdateReviewAction,
  adminDeleteReviewAction,
} = require("@/actions");

describe("useAdminReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls reviewService.listAdmin with sieveParams", () => {
    renderHook(() => useAdminReviews("page=1"));
    expect(reviewService.listAdmin).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'reviews', sieveParams]", () => {
    renderHook(() => useAdminReviews("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "reviews", "page=1"] }),
    );
  });

  it("updateMutation calls adminUpdateReviewAction with id and data", () => {
    const { result } = renderHook(() => useAdminReviews(""));
    result.current.updateMutation.mutate({
      id: "rev-1",
      data: { status: "approved" },
    });
    expect(adminUpdateReviewAction).toHaveBeenCalledWith("rev-1", {
      status: "approved",
    });
  });

  it("deleteMutation calls adminDeleteReviewAction with id", () => {
    const { result } = renderHook(() => useAdminReviews(""));
    result.current.deleteMutation.mutate("rev-1");
    expect(adminDeleteReviewAction).toHaveBeenCalledWith("rev-1");
  });
});
