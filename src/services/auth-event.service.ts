/**
 * Auth Event Service
 *
 * Initialises an RTDB auth event node and receives a per-event custom token.
 * Used as the first step of every OAuth popup flow (Google, Apple).
 *
 * @example
 * ```ts
 * const { eventId, customToken } = await authEventService.initAuthEvent();
 * const popup = window.open(`/api/auth/google/start?eventId=${eventId}`, 'oauth', '...');
 * authEvent.subscribe(eventId, customToken);
 * ```
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export interface AuthEventResponse {
  eventId: string;
  customToken: string;
  expiresAt: number;
}

export const authEventService = {
  /**
   * POST /api/auth/event/init
   * Creates the RTDB event node and returns the per-event custom token.
   * No session cookie required — designed for pre-authentication flows.
   */
  initAuthEvent: (): Promise<AuthEventResponse> =>
    apiClient.post(API_ENDPOINTS.AUTH.EVENT_INIT, {}),
};
