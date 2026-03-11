/**
 * useFeedbackSubmit Tests — Phase 62
 *
 * Verifies that useFeedbackSubmit delegates to eventService.enter() and
 * forwards onSuccess / onError callbacks.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useFeedbackSubmit } from "../useFeedbackSubmit";

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

describe("useFeedbackSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
      error: null,
    }));
  });

  it("calls eventService.enter with eventId and feedback payload", () => {
    const payload = { rating: 5, comment: "Great!" };
    const { result } = renderHook(() => useFeedbackSubmit("evt-2"));
    result.current.mutate(payload);
    expect(eventService.enter).toHaveBeenCalledWith("evt-2", payload);
  });

  it("forwards onSuccess callback via useApiMutation options", () => {
    const onSuccess = jest.fn();
    renderHook(() => useFeedbackSubmit("evt-2", { onSuccess }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("forwards onError callback via useApiMutation options", () => {
    const onError = jest.fn();
    renderHook(() => useFeedbackSubmit("evt-2", { onError }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });
});
