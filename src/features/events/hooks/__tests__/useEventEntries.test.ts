/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEventEntries } from "../useEventEntries";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("../../services/event.service", () => ({
  eventService: {
    adminGetEntries: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { eventService } = require("../../services/event.service");

describe("useEventEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.adminGetEntries with eventId and params", () => {
    renderHook(() =>
      useEventEntries({ eventId: "evt-1", params: "sort=-createdAt" }),
    );
    expect(eventService.adminGetEntries).toHaveBeenCalledWith(
      "evt-1",
      "sort=-createdAt",
    );
  });

  it("uses queryKey ['admin-event-entries', eventId, params]", () => {
    renderHook(() => useEventEntries({ eventId: "evt-1", params: "page=2" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["admin-event-entries", "evt-1", "page=2"],
      }),
    );
  });

  it("returns empty entries when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useEventEntries({ eventId: "evt-1" }));
    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.total).toBe(0);
  });

  it("does not query when eventId is empty", () => {
    renderHook(() => useEventEntries({ eventId: "" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });
});
