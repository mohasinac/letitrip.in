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
} from "@/features/admin";
import { AdminSessionsManager as AdminSessionsShell } from "@mohasinac/appkit/features/admin";
import { Grid, Heading, Text, Badge, Button } from "@mohasinac/appkit/ui";
import { Card, Alert, ConfirmDeleteModal, DataTable } from "@/components";
import { useToast } from "@/components";
import { SESSION_TABLE_COLUMNS } from "./SessionTableColumns";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { formatRelativeTime, formatDate, nowMs, isFuture } from "@/utils";
import { useState } from "react";

const { flex } = THEME_CONSTANTS;

// Helper to format relative time
function formatTimeAgo(date: Date | string): string {
  const now = nowMs();
  const past = new Date(date);
  const diffMs = now - past.getTime();
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
  const { showToast } = useToast();
  const t = useTranslations("adminSessions");
  const tLoading = useTranslations("loading");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const handleRevokeSession = async (sessionId: string) => {
    setConfirmModal({
      open: true,
      title: t("confirmRevoke"),
      message: t("confirmRevokeMessage"),
      onConfirm: async () => {
        try {
          await revokeSession.mutateAsync({ sessionId });
          showToast(SUCCESS_MESSAGES.ADMIN.SESSION_REVOKED, "success");
          refetch();
        } catch (error) {
          showToast(ERROR_MESSAGES.ADMIN.REVOKE_SESSION_FAILED, "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleRevokeAllUserSessions = async (
    userId: string,
    userEmail: string,
  ) => {
    setConfirmModal({
      open: true,
      title: t("confirmRevokeAll"),
      message: t("confirmRevokeAllMessage", { userEmail }),
      onConfirm: async () => {
        try {
          await revokeUserSessions.mutateAsync({ userId });
          showToast(SUCCESS_MESSAGES.ADMIN.SESSIONS_REVOKED, "success");
          refetch();
        } catch (error) {
          showToast(ERROR_MESSAGES.ADMIN.REVOKE_USER_SESSIONS_FAILED, "error");
        }
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  if (isLoading) {
    return (
      <div className={`${flex.center} p-8`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Text variant="secondary">{tLoading("default")}</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t("loadErrorTitle")}>
        {t("loadError")}
      </Alert>
    );
  }

  const stats = data?.stats;
  const sessions = data?.sessions || [];

  return (
    <AdminSessionsShell
      renderStats={() => (
        <Grid
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4"
          gap="md"
        >
          <Card className="p-4">
            <Text variant="secondary" size="sm">
              {t("stats.active")}
            </Text>
            <Text weight="bold" className="text-3xl mt-2">
              {stats?.totalActive || 0}
            </Text>
          </Card>
          <Card className="p-4">
            <Text variant="secondary" size="sm">
              {t("stats.uniqueUsers")}
            </Text>
            <Text weight="bold" className="text-3xl mt-2">
              {stats?.uniqueUsers || 0}
            </Text>
          </Card>
          <Card className="p-4">
            <Text variant="secondary" size="sm">
              {t("stats.recentActivity")}
            </Text>
            <Text weight="bold" className="text-3xl mt-2">
              {stats?.recentActivity || 0}
            </Text>
          </Card>
          <Card className="p-4">
            <Text variant="secondary" size="sm">
              {t("stats.expired")}
            </Text>
            <Text weight="bold" className="text-3xl mt-2">
              {stats?.totalExpired || 0}
            </Text>
          </Card>
        </Grid>
      )}
      renderTable={() => (
        <Card>
          <div className={`p-4 border-b ${THEME_CONSTANTS.themed.borderColor}`}>
            <Heading level={3}>{t("tableTitle")}</Heading>
            <Text variant="secondary" size="sm" className="mt-1">
              {t("description")}
            </Text>
          </div>

          <DataTable
            columns={SESSION_TABLE_COLUMNS}
            data={sessions}
            loading={isLoading}
            keyExtractor={(session) => session.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            actions={(session) =>
              session.isActive ? (
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={revokeSession.isPending}
                  >
                    {t("revoke")}
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
                    disabled={revokeUserSessions.isPending}
                  >
                    {t("revokeAll")}
                  </Button>
                </div>
              ) : null
            }
          />
        </Card>
      )}
      renderConfirmModal={() => (
        <ConfirmDeleteModal
          isOpen={confirmModal.open}
          onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      )}
    />
  );
}
