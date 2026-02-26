/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEvents } from "../useEvents";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("../../services/event.service", () => ({
  eventService: {
    adminList: jest.fn().mockResolvedValue({
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

describe("useEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.adminList with empty params by default", () => {
    renderHook(() => useEvents());
    expect(eventService.adminList).toHaveBeenCalledWith("");
  });

  it("uses queryKey ['admin-events', params]", () => {
    renderHook(() => useEvents({ params: "sort=-createdAt" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["admin-events", "sort=-createdAt"],
      }),
    );
  });

  it("returns default empty values when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useEvents());
    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.total).toBe(0);
  });
});
