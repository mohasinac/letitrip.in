import { apiService } from "../api.service";
import { eventsService, type Event } from "../events.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("EventsService", () => {
  const mockEvent: Event = {
    id: "event_1",
    title: "Test Event",
    description: "A test event",
    type: "workshop",
    startDate: "2024-12-10T10:00:00Z",
    endDate: "2024-12-10T12:00:00Z",
    location: "Test Location",
    imageUrl: "/event.jpg",
    registrationRequired: true,
    maxParticipants: 50,
    participantCount: 10,
    status: "upcoming",
    isOnline: false,
    registrationDeadline: "2024-12-09T23:59:59Z",
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should fetch all events without filters", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.list();

      expect(apiService.get).toHaveBeenCalledWith("/api/events?");
      expect(result).toEqual(mockResponse);
    });

    it("should filter by type", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventsService.list({ type: "workshop" });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?type=workshop");
    });

    it("should not add type filter when type is 'all'", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventsService.list({ type: "all" });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?");
    });

    it("should filter by upcoming", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventsService.list({ upcoming: true });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?upcoming=true");
    });

    it("should filter by status", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventsService.list({ status: "ongoing" });

      expect(apiService.get).toHaveBeenCalledWith("/api/events?status=ongoing");
    });

    it("should combine multiple filters", async () => {
      const mockResponse = {
        success: true,
        events: [mockEvent],
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventsService.list({
        type: "seminar",
        upcoming: true,
        status: "upcoming",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/events?type=seminar&upcoming=true&status=upcoming"
      );
    });
  });

  describe("getById", () => {
    it("should fetch event by ID", async () => {
      const mockResponse = {
        success: true,
        event: mockEvent,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.getById("event_1");

      expect(apiService.get).toHaveBeenCalledWith("/api/events/event_1");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("register", () => {
    it("should register for an event", async () => {
      const mockResponse = {
        success: true,
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.register("event_1");

      expect(apiService.post).toHaveBeenCalledWith(
        "/api/events/event_1/register",
        {}
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("checkRegistration", () => {
    it("should check if user is registered", async () => {
      const mockResponse = {
        success: true,
        registered: true,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.checkRegistration("event_1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/api/events/event_1/register"
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return not registered", async () => {
      const mockResponse = {
        success: true,
        registered: false,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.checkRegistration("event_1");

      expect(result.registered).toBe(false);
    });
  });

  describe("vote", () => {
    it("should vote in a poll event", async () => {
      const mockResponse = {
        success: true,
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.vote("event_1", "option_1");

      expect(apiService.post).toHaveBeenCalledWith("/api/events/event_1/vote", {
        optionId: "option_1",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("checkVote", () => {
    it("should check if user has voted", async () => {
      const mockResponse = {
        success: true,
        voted: true,
        optionId: "option_1",
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.checkVote("event_1");

      expect(apiService.get).toHaveBeenCalledWith("/api/events/event_1/vote");
      expect(result).toEqual(mockResponse);
    });

    it("should return not voted", async () => {
      const mockResponse = {
        success: true,
        voted: false,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventsService.checkVote("event_1");

      expect(result.voted).toBe(false);
      expect(result.optionId).toBeUndefined();
    });
  });
});
