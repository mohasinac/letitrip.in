import { apiService } from "./api.service";

export interface Event {
  id: string;
  title: string;
  description: string;
  type: "workshop" | "seminar" | "competition" | "poll" | "announcement";
  startDate: string;
  endDate: string;
  location?: string;
  imageUrl?: string;
  registrationRequired: boolean;
  maxParticipants?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  registeredAt: string;
  attended?: boolean;
}

export interface EventVote {
  eventId: string;
  optionId: string;
  userId: string;
  votedAt: string;
}

class EventsService {
  /**
   * List events with optional filters
   */
  async list(params?: {
    type?: string;
    upcoming?: boolean;
    status?: string;
  }): Promise<{ success: boolean; events: Event[] }> {
    const queryParams = new URLSearchParams();
    if (params?.type && params.type !== "all") {
      queryParams.append("type", params.type);
    }
    if (params?.upcoming) {
      queryParams.append("upcoming", "true");
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }

    return apiService.get(`/api/events?${queryParams.toString()}`);
  }

  /**
   * Get event by ID
   */
  async getById(eventId: string): Promise<{ success: boolean; event: Event }> {
    return apiService.get(`/api/events/${eventId}`);
  }

  /**
   * Register for an event
   */
  async register(eventId: string): Promise<{ success: boolean }> {
    return apiService.post(`/api/events/${eventId}/register`, {});
  }

  /**
   * Check if user is registered for event
   */
  async checkRegistration(
    eventId: string
  ): Promise<{ success: boolean; registered: boolean }> {
    return apiService.get(`/api/events/${eventId}/register`);
  }

  /**
   * Vote in a poll event
   */
  async vote(eventId: string, optionId: string): Promise<{ success: boolean }> {
    return apiService.post(`/api/events/${eventId}/vote`, { optionId });
  }

  /**
   * Check if user has voted in poll
   */
  async checkVote(
    eventId: string
  ): Promise<{ success: boolean; voted: boolean; optionId?: string }> {
    return apiService.get(`/api/events/${eventId}/vote`);
  }

  /**
   * Admin: Create event
   */
  async create(eventData: Partial<Event>): Promise<{ success: boolean }> {
    return apiService.post("/api/admin/events", eventData);
  }

  /**
   * Admin: Update event
   */
  async update(
    eventId: string,
    eventData: Partial<Event>
  ): Promise<{ success: boolean }> {
    return apiService.put(`/api/admin/events/${eventId}`, eventData);
  }

  /**
   * Admin: Delete event
   */
  async delete(eventId: string): Promise<{ success: boolean }> {
    return apiService.delete(`/api/admin/events/${eventId}`);
  }

  /**
   * Admin: Get event by ID
   */
  async getByIdAdmin(
    eventId: string
  ): Promise<{ success: boolean; event: Event }> {
    return apiService.get(`/api/admin/events/${eventId}`);
  }
}

export const eventsService = new EventsService();
