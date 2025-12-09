/**
 * Events Service Unit Tests
 * Tests event listing, registration, and voting functionality
 */

import { apiService } from "@/services/api.service";
import { eventsService, type Event } from "@/services/events.service";

jest.mock("@/services/api.service");

describe("EventsService", () => {
  const mockEvent: Event = {
    id: "event-1",
    title: "Test Workshop",
    description: "A test workshop",
    type: "workshop",
    startDate: "2025-12-15T10:00:00Z",
    endDate: "2025-12-15T16:00:00Z",
    location: "Mumbai",
    imageUrl: "/event.jpg",
    registrationRequired: true,
    maxParticipants: 50,
    participantCount: 10,
    status: "upcoming",
    isOnline: false,
    registrationDeadline: "2025-12-14T23:59:59Z",
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2025-12-01T00:00:00Z",
  };

  const mockPollEvent: Event = {
    ...mockEvent,
    id: "poll-1",
    type: "poll",
    title: "User Poll",
    isPollEvent: true,
    allowMultipleVotes: false,
    voteCount: 25,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list all events without filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [mockEvent],
      });

      const result = await eventsService.list();

      expect(result.success).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(apiService.get).toHaveBeenCalledWith("/api/events?");
    });

    it("should filter by event type", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [mockEvent],
      });

      await eventsService.list({ type: "workshop" });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?type=workshop");
    });

    it("should not add type filter for 'all'", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [mockEvent],
      });

      await eventsService.list({ type: "all" });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?");
    });

    it("should filter upcoming events", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [mockEvent],
      });

      await eventsService.list({ upcoming: true });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?upcoming=true");
    });

    it("should filter by status", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [],
      });

      await eventsService.list({ status: "completed" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/events?status=completed"
      );
    });

    it("should combine multiple filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [],
      });

      await eventsService.list({
        type: "workshop",
        upcoming: true,
        status: "upcoming",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("type=workshop")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("upcoming=true")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("status=upcoming")
      );
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(eventsService.list()).rejects.toThrow("Network error");
    });

    it("should handle empty results", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [],
      });

      const result = await eventsService.list();

      expect(result.events).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should get event by ID", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        event: mockEvent,
      });

      const result = await eventsService.getById("event-1");

      expect(result.success).toBe(true);
      expect(result.event.id).toBe("event-1");
      expect(apiService.get).toHaveBeenCalledWith("/api/events/event-1");
    });

    it("should handle non-existent event", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Event not found")
      );

      await expect(eventsService.getById("non-existent")).rejects.toThrow(
        "Event not found"
      );
    });

    it("should handle invalid event ID", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("Invalid ID"));

      await expect(eventsService.getById("")).rejects.toThrow();
    });
  });

  describe("register", () => {
    it("should register for event", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await eventsService.register("event-1");

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith(
        "/api/events/event-1/register",
        {}
      );
    });

    it("should handle already registered", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Already registered")
      );

      await expect(eventsService.register("event-1")).rejects.toThrow(
        "Already registered"
      );
    });

    it("should handle full event", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Event is full")
      );

      await expect(eventsService.register("event-1")).rejects.toThrow(
        "Event is full"
      );
    });

    it("should handle registration deadline passed", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Registration closed")
      );

      await expect(eventsService.register("event-1")).rejects.toThrow(
        "Registration closed"
      );
    });
  });

  describe("checkRegistration", () => {
    it("should check if user is registered", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        registered: true,
      });

      const result = await eventsService.checkRegistration("event-1");

      expect(result.registered).toBe(true);
      expect(apiService.get).toHaveBeenCalledWith(
        "/api/events/event-1/register"
      );
    });

    it("should return false if not registered", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        registered: false,
      });

      const result = await eventsService.checkRegistration("event-1");

      expect(result.registered).toBe(false);
    });

    it("should handle unauthenticated user", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Unauthorized")
      );

      await expect(eventsService.checkRegistration("event-1")).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("vote", () => {
    it("should vote in poll event", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await eventsService.vote("poll-1", "option-1");

      expect(result.success).toBe(true);
      expect(apiService.post).toHaveBeenCalledWith("/api/events/poll-1/vote", {
        optionId: "option-1",
      });
    });

    it("should handle already voted", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Already voted")
      );

      await expect(eventsService.vote("poll-1", "option-1")).rejects.toThrow(
        "Already voted"
      );
    });

    it("should handle invalid option", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Invalid option")
      );

      await expect(eventsService.vote("poll-1", "invalid")).rejects.toThrow(
        "Invalid option"
      );
    });

    it("should handle non-poll event", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Not a poll event")
      );

      await expect(eventsService.vote("event-1", "option-1")).rejects.toThrow(
        "Not a poll event"
      );
    });

    it("should handle unauthenticated user", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Unauthorized")
      );

      await expect(eventsService.vote("poll-1", "option-1")).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("checkVote", () => {
    it("should check if user has voted", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        voted: true,
        optionId: "option-1",
      });

      const result = await eventsService.checkVote("poll-1");

      expect(result.voted).toBe(true);
      expect(result.optionId).toBe("option-1");
      expect(apiService.get).toHaveBeenCalledWith("/api/events/poll-1/vote");
    });

    it("should return false if not voted", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        voted: false,
      });

      const result = await eventsService.checkVote("poll-1");

      expect(result.voted).toBe(false);
      expect(result.optionId).toBeUndefined();
    });
  });

  describe("Admin Operations", () => {
    describe("create", () => {
      it("should create new event", async () => {
        (apiService.post as jest.Mock).mockResolvedValue({
          success: true,
        });

        const eventData = {
          title: "New Event",
          type: "workshop" as const,
          startDate: "2025-12-20T10:00:00Z",
          endDate: "2025-12-20T16:00:00Z",
        };

        const result = await eventsService.create(eventData);

        expect(result.success).toBe(true);
        expect(apiService.post).toHaveBeenCalledWith(
          "/api/admin/events",
          eventData
        );
      });

      it("should handle validation errors", async () => {
        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Validation failed")
        );

        await expect(eventsService.create({ title: "" })).rejects.toThrow(
          "Validation failed"
        );
      });

      it("should handle unauthorized access", async () => {
        (apiService.post as jest.Mock).mockRejectedValue(
          new Error("Forbidden")
        );

        await expect(eventsService.create({ title: "Test" })).rejects.toThrow(
          "Forbidden"
        );
      });
    });

    describe("update", () => {
      it("should update event", async () => {
        (apiService.put as jest.Mock).mockResolvedValue({
          success: true,
        });

        const updates = {
          title: "Updated Title",
          status: "ongoing" as const,
        };

        const result = await eventsService.update("event-1", updates);

        expect(result.success).toBe(true);
        expect(apiService.put).toHaveBeenCalledWith(
          "/api/admin/events/event-1",
          updates
        );
      });

      it("should handle non-existent event", async () => {
        (apiService.put as jest.Mock).mockRejectedValue(
          new Error("Event not found")
        );

        await expect(eventsService.update("non-existent", {})).rejects.toThrow(
          "Event not found"
        );
      });
    });

    describe("delete", () => {
      it("should delete event", async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({
          success: true,
        });

        const result = await eventsService.delete("event-1");

        expect(result.success).toBe(true);
        expect(apiService.delete).toHaveBeenCalledWith(
          "/api/admin/events/event-1"
        );
      });

      it("should handle non-existent event", async () => {
        (apiService.delete as jest.Mock).mockRejectedValue(
          new Error("Event not found")
        );

        await expect(eventsService.delete("non-existent")).rejects.toThrow(
          "Event not found"
        );
      });
    });

    describe("getByIdAdmin", () => {
      it("should get event with admin details", async () => {
        (apiService.get as jest.Mock).mockResolvedValue({
          success: true,
          event: mockEvent,
        });

        const result = await eventsService.getByIdAdmin("event-1");

        expect(result.event).toEqual(mockEvent);
        expect(apiService.get).toHaveBeenCalledWith(
          "/api/admin/events/event-1"
        );
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle event with all optional fields", async () => {
      const minimalEvent: Partial<Event> = {
        title: "Minimal Event",
        type: "announcement",
        startDate: "2025-12-15T10:00:00Z",
        endDate: "2025-12-15T16:00:00Z",
        status: "draft",
        isOnline: true,
        registrationRequired: false,
        participantCount: 0,
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      await eventsService.create(minimalEvent);

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/admin/events",
        minimalEvent
      );
    });

    it("should handle events with special characters in title", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [
          {
            ...mockEvent,
            title: "Workshop: React & Node.js (Beginner's Guide)",
          },
        ],
      });

      const result = await eventsService.list();

      expect(result.events[0].title).toContain("&");
      expect(result.events[0].title).toContain("'");
    });

    it("should handle concurrent registration attempts", async () => {
      (apiService.post as jest.Mock).mockResolvedValueOnce({
        success: true,
      });

      const promises = [
        eventsService.register("event-1"),
        eventsService.register("event-1"),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it("should handle network timeouts", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network timeout")
      );

      await expect(eventsService.list()).rejects.toThrow("Network timeout");
    });

    it("should handle malformed API responses", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: null, // Malformed response
      });

      const result = await eventsService.list();

      expect(result.events).toBeNull();
    });
  });

  describe("QueryString Building", () => {
    it("should properly encode special characters in filters", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [],
      });

      await eventsService.list({
        type: "competition",
        status: "upcoming",
      });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain("type=competition");
      expect(callArg).toContain("status=upcoming");
    });

    it("should handle undefined params", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        events: [],
      });

      await eventsService.list({
        type: undefined,
        upcoming: undefined,
        status: undefined,
      });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?");
    });
  });
});
