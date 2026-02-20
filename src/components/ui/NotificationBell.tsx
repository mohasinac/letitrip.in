"use client";

/**
 * NotificationBell Component
 *
 * Displays a bell icon in the TitleBar with an unread count badge.
 * Clicking it opens a dropdown showing the latest notifications.
 * Users can mark individual or all notifications as read.
 *
 * @component
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { THEME_CONSTANTS, UI_LABELS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { NotificationDocument } from "@/db/schema";
import { formatRelativeTime } from "@/utils";
import { Spinner } from "@/components";

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

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useMessage();
  const { colors } = THEME_CONSTANTS;

  const { data, isLoading, refetch } = useApiQuery<NotificationsResponse>({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const res = await fetch(API_ENDPOINTS.NOTIFICATIONS.LIST + "?limit=10");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    cacheTTL: 30000, // Cache for 30 seconds
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) refetch(); // Fetch on open
      return !prev;
    });
  }, [refetch]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      await markRead(id);
      refetch();
    },
    [markRead, refetch],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead(undefined);
      refetch();
      showSuccess(UI_LABELS.NOTIFICATIONS.MARK_ALL_READ);
    } catch {
      showError(UI_LABELS.NOTIFICATIONS.ERROR);
    }
  }, [markAllRead, refetch, showSuccess, showError]);

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={`hidden md:flex p-2.5 md:p-3 rounded-xl transition-colors relative ${colors.iconButton.onLight}`}
        aria-label={UI_LABELS.NOTIFICATIONS.TITLE}
        aria-expanded={isOpen}
      >
        {/* Bell SVG */}
        <svg
          className={`w-6 h-6 md:w-7 md:h-7 ${THEME_CONSTANTS.colors.icon.titleBar}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 ${THEME_CONSTANTS.colors.notification.badge} text-xs min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full font-semibold shadow-md`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.bgPrimary} z-50 overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${THEME_CONSTANTS.themed.border}`}
          >
            <h3
              className={`font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              {UI_LABELS.NOTIFICATIONS.TITLE}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} {UI_LABELS.NOTIFICATIONS.UNREAD}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
              >
                {isMarkingAll
                  ? UI_LABELS.LOADING.DEFAULT
                  : UI_LABELS.NOTIFICATIONS.MARK_ALL_READ}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <svg
                  className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
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
                <p
                  className={`font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  {UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS}
                </p>
                <p
                  className={`text-sm mt-1 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  {UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS_DESC}
                </p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`group flex items-start gap-3 px-4 py-3 border-b ${THEME_CONSTANTS.themed.border} last:border-0 transition-colors hover:${THEME_CONSTANTS.themed.bgSecondary} ${
                      !n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Icon */}
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {NOTIFICATION_TYPE_ICONS[n.type] ?? "🔔"}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} leading-tight`}
                        >
                          {n.title}
                          {!n.isRead && (
                            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 align-middle" />
                          )}
                        </p>
                        <span
                          className={`text-xs ${THEME_CONSTANTS.themed.textSecondary} flex-shrink-0`}
                        >
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-0.5 line-clamp-2`}
                      >
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5">
                        {n.actionUrl && (
                          <Link
                            href={n.actionUrl}
                            onClick={() => {
                              if (!n.isRead) handleMarkRead(n.id);
                              setIsOpen(false);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {n.actionLabel ?? UI_LABELS.ACTIONS.VIEW}
                          </Link>
                        )}
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline"
                          >
                            {UI_LABELS.NOTIFICATIONS.MARK_READ}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-4 py-3 border-t ${THEME_CONSTANTS.themed.border} text-center`}
          >
            <Link
              href={ROUTES.USER.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {UI_LABELS.NOTIFICATIONS.VIEW_ALL}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
