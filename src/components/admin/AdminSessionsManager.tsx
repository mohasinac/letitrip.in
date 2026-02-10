/**
 * Admin Sessions Management Component
 *
 * Displays active user sessions with device info, location, and activity.
 * Allows admins to revoke sessions for security purposes.
 */

"use client";

import {
  useAdminSessions,
  useRevokeSession,
  useRevokeUserSessions,
} from "@/hooks";
import { Card, Button, Alert, Badge } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { formatRelativeTime, formatDate } from "@/utils";

// Helper to format relative time
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(past);
}

export function AdminSessionsManager() {
  const { data, isLoading, error, refetch } = useAdminSessions(200);
  const revokeSession = useRevokeSession();
  const revokeUserSessions = useRevokeUserSessions();

  const handleRevokeSession = async (sessionId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this session? The user will be logged out.",
      )
    ) {
      return;
    }

    try {
      await revokeSession.mutate({ sessionId });
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.ADMIN.REVOKE_SESSION_FAILED, error);
    }
  };

  const handleRevokeAllUserSessions = async (
    userId: string,
    userEmail: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to revoke ALL sessions for ${userEmail}? They will be logged out from all devices.`,
      )
    ) {
      return;
    }

    try {
      await revokeUserSessions.mutate({ userId });
      refetch();
    } catch (error) {
      console.error(ERROR_MESSAGES.ADMIN.REVOKE_USER_SESSIONS_FAILED, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={THEME_CONSTANTS.themed.textSecondary}>
            {UI_LABELS.LOADING.DEFAULT}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Error">
        Failed to load sessions. Please try again.
      </Alert>
    );
  }

  const stats = data?.stats;
  const sessions = data?.sessions || [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            Active Sessions
          </div>
          <div className="text-3xl font-bold mt-2">
            {stats?.totalActive || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            Unique Users
          </div>
          <div className="text-3xl font-bold mt-2">
            {stats?.uniqueUsers || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            Recent Activity (24h)
          </div>
          <div className="text-3xl font-bold mt-2">
            {stats?.recentActivity || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            Expired Sessions
          </div>
          <div className="text-3xl font-bold mt-2">
            {stats?.totalExpired || 0}
          </div>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <div className={`p-4 border-b ${THEME_CONSTANTS.themed.borderColor}`}>
          <h3
            className={`text-lg font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Active Sessions
          </h3>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Monitor and manage user sessions across all devices
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={THEME_CONSTANTS.themed.bgTertiary}>
              <tr>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  User
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  Device
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  Location
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  Last Activity
                </th>
                <th
                  className={`px-4 py-3 text-left text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  Status
                </th>
                <th
                  className={`px-4 py-3 text-right text-xs font-medium ${THEME_CONSTANTS.themed.textSecondary} uppercase tracking-wider`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`${THEME_CONSTANTS.themed.bgSecondary} divide-y divide-gray-200 dark:divide-gray-700`}
            >
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div
                        className={`text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
                      >
                        {session.user?.displayName || "Unknown User"}
                      </div>
                      <div
                        className={`text-xs ${THEME_CONSTANTS.themed.textSecondary}`}
                      >
                        {session.user?.email}
                      </div>
                      <div className="mt-1">
                        <Badge
                          variant={
                            session.user?.role === "admin"
                              ? "danger"
                              : session.user?.role === "moderator"
                                ? "warning"
                                : session.user?.role === "seller"
                                  ? "info"
                                  : "default"
                          }
                        >
                          {session.user?.role}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div
                        className={`text-sm ${THEME_CONSTANTS.themed.textPrimary}`}
                      >
                        {session.deviceInfo?.browser} on{" "}
                        {session.deviceInfo?.os}
                      </div>
                      <div
                        className={`text-xs ${THEME_CONSTANTS.themed.textSecondary}`}
                      >
                        {session.deviceInfo?.device}
                      </div>
                      {session.deviceInfo?.ip && (
                        <div
                          className={`text-xs ${THEME_CONSTANTS.themed.textMuted}`}
                        >
                          IP: {session.deviceInfo.ip}
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
                  >
                    {session.location?.city ? (
                      <div>
                        {session.location.city}, {session.location.country}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unknown</span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-4 whitespace-nowrap text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
                  >
                    {formatTimeAgo(session.lastActivity)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {session.isActive &&
                    new Date(session.expiresAt) > new Date() ? (
                      <Badge variant="success">Active</Badge>
                    ) : session.revokedAt ? (
                      <Badge variant="danger">Revoked</Badge>
                    ) : (
                      <Badge variant="default">Expired</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    {session.isActive && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokeSession.isLoading}
                        >
                          Revoke
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleRevokeAllUserSessions(
                              session.userId,
                              session.user?.email || "this user",
                            )
                          }
                          disabled={revokeUserSessions.isLoading}
                        >
                          Revoke All
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sessions.length === 0 && (
            <div
              className={`text-center py-12 ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              No active sessions found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
