/**
 * @fileoverview Service Module
 * @module src/services/events.service
 * @description This file contains service functions for events operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { apiService } from "./api.service";

/**
 * Event interface
 * 
 * @interface
 * @description Defines the structure and contract for Event
 */
export interface Event {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Type */
  type: "workshop" | "seminar" | "competition" | "poll" | "announcement";
  /** Start Date */
  startDate: string;
  /** End Date */
  endDate: string;
  /** Location */
  location?: string;
  /** Image Url */
  imageUrl?: string;
  /** Registration Required */
  registrationRequired: boolean;
  /** Max Participants */
  maxParticipants?: number;
  /** Participant Count */
  participantCount: number;
  /** Status */
  status: "upcoming" | "ongoing" | "completed" | "cancelled" | "draft";
  /** Is Online */
  isOnline: boolean;
  /** Registration Deadline */
  registrationDeadline?: string;
  /** Is Poll Event */
  isPollEvent?: boolean;
  /** Allow Multiple Votes */
  allowMultipleVotes?: boolean;
  /** Vote Count */
  voteCount?: number;
  /** Created At */
  createdAt: string;
  /** Updated At */
  updatedAt: string;
}

/**
 * EventRegistration interface
 * 
 * @interface
 * @description Defines the structure and contract for EventRegistration
 */
export interface EventRegistration {
  /** Event Id */
  eventId: string;
  /** User Id */
  userId: string;
  /** Registered At */
  registeredAt: string;
  /** Attended */
  attended?: boolean;
}

/**
 * EventVote interface
 * 
 * @interface
 * @description Defines the structure and contract for EventVote
 */
export interface EventVote {
  /** Event Id */
  eventId: string;
  /** Option Id */
  optionId: string;
  /** User Id */
  userId: string;
  /** Voted At */
  votedAt: string;
}

/**
 * EventsService class
 * 
 * @class
 * @description Description of EventsService class functionality
 */
class EventsService {
  /**
   * List events with optional filters
   */
  async list(params?: {
    /** Type */
    type?: string;
    /** Upcoming */
    upcoming?: boolean;
    /** Status */
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
    /** Event Id */
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
    /** Event Id */
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
    /** Event Id */
    eventId: string,
    /** Event Data */
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
    /** Event Id */
    eventId: string
  ): Promise<{ success: boolean; event: Event }> {
    return apiService.get(`/api/admin/events/${eventId}`);
  }
}

export const eventsService = new EventsService();
