/**
 * User Notifications Page
 *
 * Route: /user/notifications
 * Displays all notifications for the authenticated user.
 * Users can read, mark as read, and delete notifications.
 */

"use client";

import { useCallback } from "react";
import { ROUTES, UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { Spinner, EmptyState, Badge } from "@/components";
import { NotificationDocument } from "@/db/schema";
import { formatRelativeTime } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const { themed, typography, spacing } = THEME_CONSTANTS;

interface NotificationsResponse {
  notifications: NotificationDocument[];
  unreadCount: number;
}

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  order_placed: "🛍️",
  order_confirmed: "✅",
  order_shipped: "📦",
  order_delivered: "🎉",
  order_cancelled: "❌",
  bid_placed: "🔨",
  bid_outbid: "⚡",
  bid_won: "🏆",
  bid_lost: "😔",
  review_approved: "⭐",
  review_replied: "💬",
  product_available: "🔔",
  promotion: "🏷️",
  system: "ℹ️",
  welcome: "👋",
};

export default function UserNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
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
    cacheTTL: 0, // Always fetch fresh on page load
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

  return (
    <div className={`container mx-auto px-4 py-8 max-w-3xl ${spacing.stack}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {UI_LABELS.NOTIFICATIONS.TITLE}
          </h1>
          {unreadCount > 0 && (
            <p className={`mt-1 text-sm ${themed.textSecondary}`}>
              {unreadCount} {UI_LABELS.NOTIFICATIONS.UNREAD.toLowerCase()}{" "}
              notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
          >
            {isMarkingAll
              ? UI_LABELS.LOADING.SAVING
              : UI_LABELS.NOTIFICATIONS.MARK_ALL_READ}
          </button>
        )}
      </div>

      {/* Content */}
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
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 transition-colors ${
                !n.isRead
                  ? "bg-blue-50/50 dark:bg-blue-950/20"
                  : themed.bgPrimary
              }`}
            >
              {/* Icon */}
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {NOTIFICATION_TYPE_ICONS[n.type] ?? "🔔"}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-semibold text-sm ${themed.textPrimary}`}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <Badge variant="info">
                          {UI_LABELS.NOTIFICATIONS.NEW_BADGE}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 ${themed.textSecondary}`}>
                      {n.message}
                    </p>
                    <p className={`text-xs mt-1.5 ${themed.textSecondary}`}>
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        title={UI_LABELS.NOTIFICATIONS.MARK_READ}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      title={UI_LABELS.NOTIFICATIONS.DELETE}
                      className={`p-1.5 rounded-lg ${themed.textSecondary} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action link */}
                {n.actionUrl && (
                  <a
                    href={n.actionUrl}
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n.id);
                    }}
                    className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {n.actionLabel ?? UI_LABELS.ACTIONS.VIEW} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
