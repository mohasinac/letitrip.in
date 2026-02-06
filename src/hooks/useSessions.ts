"use client";

/**
 * Session Management Hooks
 *
 * React hooks for fetching and managing sessions in admin dashboard and user settings.
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { apiClient } from "@/lib/api-client";
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
      apiClient.get<SessionsResponse>(`/api/admin/sessions?limit=${limit}`),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch sessions for specific user (admin only)
 */
export function useUserSessions(userId: string | null) {
  return useApiQuery<SessionsResponse>({
    queryKey: ["user-sessions", userId || ""],
    queryFn: () =>
      apiClient.get<SessionsResponse>(`/api/admin/sessions?userId=${userId}`),
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
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke session");
      }

      return response.json();
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
      const response = await fetch("/api/admin/sessions/revoke-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke user sessions");
      }

      return response.json();
    },
  });
}

/**
 * Get my sessions (user)
 */
export function useMySessions() {
  return useApiQuery<UserSessionsResponse>({
    queryKey: ["my-sessions"],
    queryFn: () => apiClient.get<UserSessionsResponse>("/api/user/sessions"),
  });
}

/**
 * Revoke my session (user)
 */
export function useRevokeMySession() {
  return useApiMutation<
    { success: boolean; message: string },
    { sessionId: string }
  >({
    mutationFn: async ({ sessionId }) => {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to revoke session");
      }

      return response.json();
    },
  });
}
