/**
 * usePlaceBid Tests — Phase 62
 *
 * Verifies that usePlaceBid delegates to bidService.create()
 * with the correct productId and bidAmount.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePlaceBid } from "../usePlaceBid";

jest.mock("../useApiMutation", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (payload: any) => opts.mutationFn(payload),
    mutateAsync: (payload: any) => opts.mutationFn(payload),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  bidService: {
    create: jest.fn().mockResolvedValue({ id: "bid-1", bidAmount: 500 }),
  },
}));

const { useApiMutation } = require("../useApiMutation");
const { bidService } = require("@/services");

describe("usePlaceBid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls bidService.create with productId and bidAmount", () => {
    const { result } = renderHook(() => usePlaceBid());
    result.current.mutate({ productId: "prod-1", bidAmount: 500 });
    expect(bidService.create).toHaveBeenCalledWith({
      productId: "prod-1",
      bidAmount: 500,
    });
  });

  it("wires mutationFn through useApiMutation", () => {
    renderHook(() => usePlaceBid());
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });

  it("returns mutation state", () => {
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => usePlaceBid());
    expect(result.current.isLoading).toBe(true);
  });
});
