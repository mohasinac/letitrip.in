"use client";

/**
 * Session Management Hooks (admin-only)
 *
 * Fetch and revoke active sessions in the admin dashboard.
 * Moved from src/hooks/useSessions.ts — admin-only, belongs in features/admin.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService } from "@/services";
import { revokeSessionAction, revokeUserSessionsAction } from "@/actions";
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

/** Fetch all active sessions (admin only). Refreshes every 30 s. */
export function useAdminSessions(limit = 100) {
  return useQuery<SessionsResponse>({
    queryKey: ["admin-sessions", limit.toString()],
    queryFn: () => adminService.listSessions(`limit=${limit}`),
    refetchInterval: 30000,
  });
}

/** Revoke a single session (admin). */
export function useRevokeSession() {
  return useMutation<
    { success: true; message: string },
    Error,
    { sessionId: string }
  >({
    mutationFn: ({ sessionId }) => revokeSessionAction({ sessionId }),
  });
}

/** Revoke all sessions for a given user (admin). */
export function useRevokeUserSessions() {
  return useMutation<
    { success: true; message: string; revokedCount: number },
    Error,
    { userId: string }
  >({
    mutationFn: ({ userId }) => revokeUserSessionsAction({ userId }),
  });
}
