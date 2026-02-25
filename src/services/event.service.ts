/**
 * Event Service — Public / Tier 1
 * Pure async functions for public-facing event API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 *
 * NOTE: Admin event operations live in `src/features/events/services/event.service.ts` (Tier 2).
 *       This file contains ONLY public endpoints so Tier 1 components can consume them
 *       without violating the architecture boundary.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const publicEventService = {
  /** List public events with optional filters/pagination */
  list: (params?: string) =>
    apiClient.get(`${API_ENDPOINTS.EVENTS.LIST}${params ? `?${params}` : ""}`),

  /** Get a single public event by ID */
  getById: (id: string) => apiClient.get(API_ENDPOINTS.EVENTS.DETAIL(id)),

  /** Submit a participation entry (poll vote, feedback, survey) */
  enter: (id: string, data: unknown) =>
    apiClient.post(API_ENDPOINTS.EVENTS.ENTER(id), data),

  /** Get the leaderboard for an event */
  getLeaderboard: (id: string) =>
    apiClient.get(API_ENDPOINTS.EVENTS.LEADERBOARD(id)),
};
