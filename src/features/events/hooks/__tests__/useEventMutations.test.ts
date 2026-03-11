/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import {
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useChangeEventStatus,
} from "../useEventMutations";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: jest.fn(opts?.mutationFn ?? jest.fn()),
    mutateAsync: jest.fn(),
    isLoading: false,
    isPending: false,
  })),
}));

jest.mock("@/services", () => ({
  eventService: {
    adminCreate: jest.fn().mockResolvedValue({ id: "evt-new" }),
    adminUpdate: jest.fn().mockResolvedValue({ id: "evt-1" }),
    adminDelete: jest.fn().mockResolvedValue(undefined),
    adminSetStatus: jest
      .fn()
      .mockResolvedValue({ id: "evt-1", status: "active" }),
  },
}));

const { useApiMutation } = require("@/hooks");
const { eventService } = require("@/services");

describe("useEventMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useCreateEvent", () => {
    it("calls eventService.adminCreate via mutationFn", () => {
      renderHook(() => useCreateEvent());
      const { mutationFn } = (useApiMutation as jest.Mock).mock.calls[0][0];
      mutationFn({ title: "New Event", type: "poll" });
      expect(eventService.adminCreate).toHaveBeenCalled();
    });
  });

  describe("useUpdateEvent", () => {
    it("calls eventService.adminUpdate via mutationFn", () => {
      renderHook(() => useUpdateEvent());
      const { mutationFn } = (useApiMutation as jest.Mock).mock.calls[0][0];
      mutationFn({ id: "evt-1", data: { title: "Updated" } });
      expect(eventService.adminUpdate).toHaveBeenCalledWith("evt-1", {
        title: "Updated",
      });
    });
  });

  describe("useDeleteEvent", () => {
    it("calls eventService.adminDelete via mutationFn", () => {
      renderHook(() => useDeleteEvent());
      const { mutationFn } = (useApiMutation as jest.Mock).mock.calls[0][0];
      mutationFn("evt-1");
      expect(eventService.adminDelete).toHaveBeenCalledWith("evt-1");
    });
  });

  describe("useChangeEventStatus", () => {
    it("calls eventService.adminSetStatus via mutationFn", () => {
      renderHook(() => useChangeEventStatus());
      const { mutationFn } = (useApiMutation as jest.Mock).mock.calls[0][0];
      mutationFn({ id: "evt-1", status: "active" });
      expect(eventService.adminSetStatus).toHaveBeenCalledWith(
        "evt-1",
        "active",
      );
    });
  });
});
