/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEventStats } from "../useEventStats";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  eventService: {
    adminGetStats: jest.fn().mockResolvedValue({
      totalEntries: 10,
      approvedEntries: 8,
      flaggedEntries: 1,
      pendingEntries: 1,
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { eventService } = require("@/services");

describe("useEventStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.adminGetStats with eventId", () => {
    renderHook(() => useEventStats({ eventId: "evt-1" }));
    expect(eventService.adminGetStats).toHaveBeenCalledWith("evt-1");
  });

  it("uses queryKey ['admin-event-stats', eventId]", () => {
    renderHook(() => useEventStats({ eventId: "evt-1" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin-event-stats", "evt-1"] }),
    );
  });

  it("returns null stats when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useEventStats({ eventId: "evt-1" }));
    expect(result.current.stats).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });
});
