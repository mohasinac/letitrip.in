/**
 * User Notifications Page
 *
 * Route: /user/notifications
 * Displays all notifications for the authenticated user.
 * Users can read, mark as read, and delete notifications.
 */

"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { Spinner, EmptyState } from "@/components";
import { NotificationItem, NotificationsBulkActions } from "@/components";
import type { NotificationDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

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

export default function UserNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const { data, isLoading, refetch } = useApiQuery<NotificationsResponse>({
    queryKey: ["notifications", "page"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.LIST + "?limit=50");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      return json.data;
    },
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: markRead } = useApiMutation<unknown, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { mutate: deleteOne } = useApiMutation<unknown, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.DELETE(id), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { mutate: markAllRead, isLoading: isMarkingAll } = useApiMutation<
    unknown,
    void
  >({
    mutationFn: async () => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleMarkRead = useCallback(
    async (id: string) => {
      try {
        await markRead(id);
        refetch();
      } catch {
        showError(UI_LABELS.NOTIFICATIONS.ERROR);
      }
    },
    [markRead, refetch, showError],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteOne(id);
        refetch();
        showSuccess(UI_LABELS.NOTIFICATIONS.DELETE);
      } catch {
        showError(UI_LABELS.NOTIFICATIONS.ERROR);
      }
    },
    [deleteOne, refetch, showSuccess, showError],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead();
      refetch();
      showSuccess(UI_LABELS.NOTIFICATIONS.MARK_ALL_READ);
    } catch {
      showError(UI_LABELS.NOTIFICATIONS.ERROR);
    }
  }, [markAllRead, refetch, showSuccess, showError]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={bellIcon}
          title={UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS}
          description={UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS_DESC}
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
