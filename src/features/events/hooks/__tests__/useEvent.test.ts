/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useEvent } from "../useEvent";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  eventService: {
    adminGetById: jest.fn().mockResolvedValue({ id: "evt-1", title: "Test" }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { eventService } = require("@/services");

describe("useEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls eventService.adminGetById with correct id", () => {
    renderHook(() => useEvent({ id: "evt-1" }));
    expect(eventService.adminGetById).toHaveBeenCalledWith("evt-1");
  });

  it("uses queryKey ['admin-event', id]", () => {
    renderHook(() => useEvent({ id: "evt-1" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin-event", "evt-1"] }),
    );
  });

  it("returns null event when no data", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useEvent({ id: "evt-1" }));
    expect(result.current.event).toBeNull();
  });

  it("does not query when id is empty", () => {
    renderHook(() => useEvent({ id: "" }));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });
});
