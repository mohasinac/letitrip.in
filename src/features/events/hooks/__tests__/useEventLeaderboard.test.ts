/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEventLeaderboard } from "../useEventLeaderboard";

jest.mock("@/hooks/useApiQuery", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  eventService: {
    getLeaderboard: jest
      .fn()
      .mockResolvedValue({ leaderboard: [], pointsLabel: "Points" }),
  },
}));

const { useApiQuery } = require("@/hooks/useApiQuery");
const { eventService } = require("@/services");

describe("useEventLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.getLeaderboard with eventId", () => {
    renderHook(() => useEventLeaderboard("evt-1"));
    expect(eventService.getLeaderboard).toHaveBeenCalledWith("evt-1");
  });

  it("uses queryKey ['event-leaderboard', eventId]", () => {
    renderHook(() => useEventLeaderboard("evt-1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["event-leaderboard", "evt-1"] }),
    );
  });

  it("returns empty leaderboard array when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useEventLeaderboard("evt-1"));
    expect(result.current.leaderboard).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
