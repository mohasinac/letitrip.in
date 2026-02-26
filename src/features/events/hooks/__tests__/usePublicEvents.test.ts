/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePublicEvents } from "../usePublicEvents";

jest.mock("@/hooks/useApiQuery", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("../../services/event.service", () => ({
  eventService: {
    list: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    }),
  },
}));

const { useApiQuery } = require("@/hooks/useApiQuery");
const { eventService } = require("../../services/event.service");

describe("usePublicEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.list with params", () => {
    renderHook(() => usePublicEvents({ params: "status==active" }));
    expect(eventService.list).toHaveBeenCalledWith("status==active");
  });

  it("uses queryKey ['public-events', params]", () => {
    renderHook(() => usePublicEvents({ params: "types=sale" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["public-events", "types=sale"] }),
    );
  });

  it("returns empty events array when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => usePublicEvents());
    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
