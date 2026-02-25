"use client";

/**
 * Session Management Hooks
 *
 * React hooks for fetching and managing sessions in admin dashboard and user settings.
 */

import { useApiQuery } from "./useApiQuery";
import { useApiMutation } from "./useApiMutation";
import { sessionService, adminService } from "@/services";
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
    queryFn: () => adminService.listSessions(`limit=${limit}`),
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
    queryFn: () => adminService.listSessions(`userId=${userId}`),
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
    mutationFn: async ({ sessionId }) => adminService.revokeSession(sessionId),
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
    mutationFn: async ({ userId }) => adminService.revokeUserSessions(userId),
  });
}

/**
 * Get my sessions (user)
 * @deprecated No user-facing sessions UI exists. Feature planned for future implementation.
 */
export function useMySessions() {
  return useApiQuery<UserSessionsResponse>({
    queryKey: ["my-sessions"],
    queryFn: () => sessionService.listMySessions(),
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
    mutationFn: async ({ sessionId }) =>
      sessionService.revokeSession(sessionId),
  });
}
