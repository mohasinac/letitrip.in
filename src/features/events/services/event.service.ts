/**
 * Event Service (Feature-Tier 2)
 * Pure async functions for event API calls — specific to the events feature.
 * Import via `@/features/events` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const eventService = {
  // ── Public event calls ──────────────────────────────────────────────────

  /** List public events with optional filters/pagination */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.EVENTS.LIST}${params ? `?${params}` : ""}`),

  /** Get a single public event by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.EVENTS.DETAIL(id)),

  /** Submit a participation entry for a public event (survey/poll/feedback) */
  enter: (id: string, data: unknown) =>
    apiClient.post(API_ENDPOINTS.EVENTS.ENTER(id), data),

  /** Get the leaderboard for an event */
  getLeaderboard: (id: string) =>
    apiClient.get(API_ENDPOINTS.EVENTS.LEADERBOARD(id)),

  // ── Admin event calls ────────────────────────────────────────────────────

  /** Admin: list all events with Sieve filters */
  adminList: (params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.EVENTS.LIST}${params ? `?${params}` : ""}`,
    ),

  /** Admin: get a single event by ID */
  adminGetById: (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id)),

  /** Admin: create a new event */
  adminCreate: (data: unknown) =>
    apiClient.post(API_ENDPOINTS.ADMIN.EVENTS.LIST, data),

  /** Admin: update an event */
  adminUpdate: (id: string, data: unknown) =>
    apiClient.put(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id), data),

  /** Admin: delete an event */
  adminDelete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.EVENTS.DETAIL(id)),

  /** Admin: update event status (draft/published/ended) */
  adminSetStatus: (id: string, status: string) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.EVENTS.STATUS(id), { status }),

  /** Admin: get event entries */
  adminGetEntries: (id: string, params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.EVENTS.ENTRIES(id)}${params ? `?${params}` : ""}`,
    ),

  /** Admin: get event stats */
  adminGetStats: (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN.EVENTS.STATS(id)),

  /** Admin: update a single event entry (approve/flag/reject) */
  adminUpdateEntry: (eventId: string, entryId: string, data: unknown) =>
    apiClient.patch(API_ENDPOINTS.ADMIN.EVENTS.ENTRY(eventId, entryId), data),

  /** Admin: reorder event rankings */
  adminReorderEntries: (id: string, data: unknown) =>
    apiClient.patch(`${API_ENDPOINTS.ADMIN.EVENTS.ENTRIES(id)}/reorder`, data),
};
