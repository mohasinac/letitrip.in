/**
 * UserNotificationsView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/user/notifications/page.tsx (was 156 lines).
 * Displays and manages notifications for the authenticated user.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { useTranslations } from "next-intl";
import { notificationService } from "@/services";
import {
  Spinner,
  EmptyState,
  NotificationItem,
  NotificationsBulkActions,
} from "@/components";
import type { NotificationDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

interface NotificationsResponse {
  notifications: NotificationDocument[];
  unreadCount: number;
}

const bellIcon = (
  <svg
    className="w-12 h-12 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

export function UserNotificationsView() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const tNotifications = useTranslations("notifications");

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const { data, isLoading, refetch } = useApiQuery<NotificationsResponse>({
    queryKey: ["notifications", "page"],
    queryFn: () => notificationService.list("limit=50"),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: markRead } = useApiMutation<unknown, string>({
    mutationFn: (id: string) => notificationService.markRead(id),
  });

  const { mutate: deleteOne } = useApiMutation<unknown, string>({
    mutationFn: (id: string) => notificationService.delete(id),
  });

  const { mutate: markAllRead, isLoading: isMarkingAll } = useApiMutation<
    unknown,
    void
  >({
    mutationFn: () => notificationService.markAllRead(),
  });

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markRead(id);
        refetch();
      } catch {
        showError(tNotifications("error"));
      }
    },
    [markRead, refetch, showError, tNotifications],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteOne(id);
        refetch();
        showSuccess(tNotifications("deleted"));
      } catch {
        showError(tNotifications("error"));
      }
    },
    [deleteOne, refetch, showSuccess, showError, tNotifications],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      refetch();
      showSuccess(tNotifications("markAllRead"));
    } catch {
      showError(tNotifications("error"));
    }
  }, [markAllRead, refetch, showSuccess, showError, tNotifications]);

  if (authLoading || !user) {
    return (
      <div className={`${flex.center} min-h-screen`}>
        <Spinner size="lg" />
      </div>
    );
  }

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className={`container mx-auto px-4 py-8 max-w-3xl ${spacing.stack}`}>
      <NotificationsBulkActions
        unreadCount={unreadCount}
        isMarkingAll={isMarkingAll}
        onMarkAllRead={handleMarkAllRead}
      />

      {isLoading ? (
        <div className={`${flex.center} py-16`}>
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={bellIcon}
          title={tNotifications("empty")}
          description={tNotifications("emptyDesc")}
        />
      ) : (
        <div
          className={`rounded-xl border ${themed.border} overflow-hidden divide-y ${themed.border}`}
        >
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
