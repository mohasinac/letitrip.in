/**
 * usePollVote Tests — Phase 62
 *
 * Verifies that usePollVote delegates to eventService.enter() and
 * forwards onSuccess / onError callbacks.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePollVote } from "../usePollVote";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  eventService: {
    enter: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const { useApiMutation } = require("@/hooks");
const { eventService } = require("@/services");

describe("usePollVote", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
      error: null,
    }));
  });

  it("calls eventService.enter with eventId and poll vote payload", () => {
    const payload = { pollVotes: ["option-a"] };
    const { result } = renderHook(() => usePollVote("evt-1"));
    result.current.mutate(payload);
    expect(eventService.enter).toHaveBeenCalledWith("evt-1", payload);
  });

  it("forwards onSuccess callback via useApiMutation options", () => {
    const onSuccess = jest.fn();
    renderHook(() => usePollVote("evt-1", { onSuccess }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("forwards onError callback via useApiMutation options", () => {
    const onError = jest.fn();
    renderHook(() => usePollVote("evt-1", { onError }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });
});
