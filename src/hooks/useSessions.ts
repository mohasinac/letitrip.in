"use client";

/**
 * Session Management Hooks
 *
 * React hooks for fetching and managing sessions in admin dashboard and user settings.
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import type { SessionDocument } from "@/db/schema/sessions";

interface SessionWithUser extends SessionDocument {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: string;
  } | null;
}

interface SessionsResponse {
  success: boolean;
  sessions: SessionWithUser[];
  stats: {
    totalActive: number;
    totalExpired: number;
    uniqueUsers: number;
    recentActivity: number;
  };
  count: number;
}

interface UserSessionsResponse {
  success: boolean;
  sessions: SessionDocument[];
  activeCount: number;
  total: number;
}

/**
 * Fetch all active sessions (admin only)
 */
export function useAdminSessions(limit = 100) {
  return useApiQuery<SessionsResponse>({
    queryKey: ["admin-sessions", limit.toString()],
    queryFn: () =>
      apiClient.get<SessionsResponse>(
        `${API_ENDPOINTS.ADMIN.SESSIONS}?limit=${limit}`,
      ),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch sessions for specific user (admin only)
 * @deprecated No user-facing sessions UI exists. Feature planned for future implementation.
 */
export function useUserSessions(userId: string | null) {
  return useApiQuery<SessionsResponse>({
    queryKey: ["user-sessions", userId || ""],
    queryFn: () =>
      apiClient.get<SessionsResponse>(
        `${API_ENDPOINTS.ADMIN.SESSIONS}?userId=${userId}`,
      ),
    enabled: !!userId,
  });
}

/**
 * Revoke a session (admin)
 */
export function useRevokeSession() {
  return useApiMutation<
    { success: boolean; message: string },
    { sessionId: string }
  >({
    mutationFn: async ({ sessionId }) => {
      return apiClient.delete<{ success: boolean; message: string }>(
        API_ENDPOINTS.ADMIN.REVOKE_SESSION(sessionId),
      );
    },
  });
}

/**
 * Revoke all sessions for a user (admin)
 */
export function useRevokeUserSessions() {
  return useApiMutation<
    { success: boolean; message: string; revokedCount: number },
    { userId: string }
  >({
    mutationFn: async ({ userId }) => {
      return apiClient.post<{
        success: boolean;
        message: string;
        revokedCount: number;
      }>(API_ENDPOINTS.ADMIN.REVOKE_USER_SESSIONS, { userId });
    },
  });
}

/**
 * Get my sessions (user)
 * @deprecated No user-facing sessions UI exists. Feature planned for future implementation.
 */
export function useMySessions() {
  return useApiQuery<UserSessionsResponse>({
    queryKey: ["my-sessions"],
    queryFn: () =>
      apiClient.get<UserSessionsResponse>(API_ENDPOINTS.USER.SESSIONS),
  });
}

/**
 * Revoke my session (user)
 * @deprecated No user-facing sessions UI exists. Feature planned for future implementation.
 */
export function useRevokeMySession() {
  return useApiMutation<
    { success: boolean; message: string },
    { sessionId: string }
  >({
    mutationFn: async ({ sessionId }) => {
      return apiClient.delete<{ success: boolean; message: string }>(
        API_ENDPOINTS.USER.REVOKE_SESSION(sessionId),
      );
    },
  });
}
