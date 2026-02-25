/**
 * Session Service
 * Pure async functions for auth session API calls.
 * Used to replace direct fetch() calls in SessionContext and auth helpers.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const sessionService = {
  /** POST — create a session from a Firebase ID token */
  create: (data: { idToken: string }) =>
    apiClient.post(API_ENDPOINTS.AUTH.CREATE_SESSION, data),

  /** DELETE — destroy the current session (logout) */
  destroy: () => apiClient.delete(API_ENDPOINTS.AUTH.CREATE_SESSION),

  /** GET — fetch the authenticated user's profile */
  getProfile: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),

  /** POST — record session activity (heartbeat) */
  recordActivity: (data?: Record<string, unknown>) =>
    apiClient.post(API_ENDPOINTS.AUTH.SESSION_ACTIVITY, data ?? {}),

  /** POST — validate the current session is still fresh */
  validate: () => apiClient.post(API_ENDPOINTS.AUTH.SESSION_VALIDATE, {}),

  /** GET — list the current user's sessions */
  listMySessions: () => apiClient.get(API_ENDPOINTS.USER.SESSIONS),

  /** DELETE — revoke a specific session by ID */
  revokeSession: (id: string) =>
    apiClient.delete(API_ENDPOINTS.USER.REVOKE_SESSION(id)),
};
