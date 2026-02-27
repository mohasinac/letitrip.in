/**
 * useFaqVote Tests — Phase 62
 *
 * Verifies that useFaqVote delegates to faqService.vote()
 * with the correct faqId and vote value.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useFaqVote } from "../useFaqVote";

jest.mock("../useApiMutation", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (payload: any) => opts.mutationFn(payload),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  faqService: {
    vote: jest.fn().mockResolvedValue(undefined),
  },
}));

const { useApiMutation } = require("../useApiMutation");
const { faqService } = require("@/services");

describe("useFaqVote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls faqService.vote with faqId and vote='helpful'", () => {
    const { result } = renderHook(() => useFaqVote());
    result.current.mutate({ faqId: "faq-1", vote: "helpful" });
    expect(faqService.vote).toHaveBeenCalledWith("faq-1", { vote: "helpful" });
  });

  it("calls faqService.vote with vote='not-helpful'", () => {
    const { result } = renderHook(() => useFaqVote());
    result.current.mutate({ faqId: "faq-2", vote: "not-helpful" });
    expect(faqService.vote).toHaveBeenCalledWith("faq-2", {
      vote: "not-helpful",
    });
  });

  it("wires mutationFn through useApiMutation", () => {
    renderHook(() => useFaqVote());
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });
});
