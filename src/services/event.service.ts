/**
 * Event Service — Tier 1 (single source of truth)
 * Pure async functions for all event API calls (public + admin).
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 *
 * NOTE: The former Tier-2 duplicate at `src/features/events/services/event.service.ts`
 *       has been deleted (TASK-27). All event feature hooks now import from `@/services`.
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

  /** Admin: get event entries */
  adminGetEntries: (id: string, params?: string) =>
    apiClient.get(
      `${API_ENDPOINTS.ADMIN.EVENTS.ENTRIES(id)}${params ? `?${params}` : ""}`,
    ),

  /** Admin: get event stats */
  adminGetStats: (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN.EVENTS.STATS(id)),

  /** Admin: reorder event rankings */
  adminReorderEntries: (id: string, data: unknown) =>
    apiClient.patch(`${API_ENDPOINTS.ADMIN.EVENTS.ENTRIES(id)}/reorder`, data),
};
// Mutations (adminCreate/adminUpdate/adminDelete/adminSetStatus/adminUpdateEntry)
// replaced by Server Actions in @/actions/event.actions.ts
