/**
 * usePlaceBid Tests
 *
 * Verifies that usePlaceBid delegates to placeBidAction (Server Action)
 * with the correct productId and bidAmount.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePlaceBid } from "../usePlaceBid";

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useMutation: jest.fn((opts: any) => ({
    mutate: (payload: any) => opts.mutationFn(payload),
    mutateAsync: (payload: any) => opts.mutationFn(payload),
    isPending: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/actions", () => ({
  placeBidAction: jest
    .fn()
    .mockResolvedValue({ bid: { id: "bid-1", bidAmount: 500 } }),
}));

const { useMutation } = require("@tanstack/react-query");
const { placeBidAction } = require("@/actions");

describe("usePlaceBid", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls placeBidAction with productId and bidAmount", () => {
    const { result } = renderHook(() => usePlaceBid());
    result.current.mutate({ productId: "prod-1", bidAmount: 500 });
    expect(placeBidAction).toHaveBeenCalledWith({
      productId: "prod-1",
      bidAmount: 500,
    });
  });

  it("wires mutationFn through useMutation", () => {
    renderHook(() => usePlaceBid());
    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });

  it("returns mutation state", () => {
    (useMutation as jest.Mock).mockReturnValueOnce({
      mutate: jest.fn(),
      isPending: true,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => usePlaceBid());
    expect(result.current.isPending).toBe(true);
  });
});
