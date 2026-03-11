/**
 * useFaqVote Tests
 *
 * Verifies that useFaqVote delegates to voteFaqAction (Server Action)
 * with the correct faqId and vote value.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useFaqVote } from "../useFaqVote";

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
}));

jest.mock("@/actions", () => ({
  voteFaqAction: jest.fn().mockResolvedValue(undefined),
}));

const { useMutation } = require("@tanstack/react-query");
const { voteFaqAction } = require("@/actions");

describe("useFaqVote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls voteFaqAction with faqId and vote='helpful'", () => {
    const { result } = renderHook(() => useFaqVote());
    result.current.mutate({ faqId: "faq-1", vote: "helpful" });
    expect(voteFaqAction).toHaveBeenCalledWith({
      faqId: "faq-1",
      vote: "helpful",
    });
  });

  it("calls voteFaqAction with vote='not-helpful'", () => {
    const { result } = renderHook(() => useFaqVote());
    result.current.mutate({ faqId: "faq-2", vote: "not-helpful" });
    expect(voteFaqAction).toHaveBeenCalledWith({
      faqId: "faq-2",
      vote: "not-helpful",
    });
  });

  it("wires mutationFn through useMutation", () => {
    renderHook(() => useFaqVote());
    expect(useMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });
});
