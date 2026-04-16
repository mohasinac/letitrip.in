"use client";
import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import {
  Heading, Li, Text, Ul, Spinner, Span, Button, } from "@mohasinac/appkit/ui";
import { useClickOutside } from "@mohasinac/appkit/react";
import { useNotifications, useMessage } from "@/hooks";
import { NotificationDocument } from "@/db/schema";
import { formatRelativeTime } from "@mohasinac/appkit/utils";


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

import { TextLink } from "@/components";

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
  const { colors, flex } = THEME_CONSTANTS;
  const t = useTranslations("notifications");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  const {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markRead,
    markAllRead,
    isMarkingAll,
  } = useNotifications(10);

  // Close dropdown when clicking outside (Rule 8 — use useClickOutside, never manual addEventListener)
  useClickOutside(dropdownRef, () => setIsOpen(false), { enabled: isOpen });

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
      showSuccess(t("markAllRead"));
    } catch {
      showError(t("error"));
    }
  }, [markAllRead, refetch, showSuccess, showError]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        onClick={handleToggle}
        className={`hidden md:flex p-2.5 md:p-3 rounded-xl transition-colors relative ${colors.iconButton.onPrimary}`}
        aria-label={t("title")}
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
          <Span
            className={`absolute -top-1 -right-1 ${THEME_CONSTANTS.colors.notification.badge} text-xs min-w-[20px] h-5 px-1.5 ${flex.center} rounded-full font-semibold shadow-md`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.bgPrimary} z-50 overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`${flex.between} px-4 py-3 border-b ${THEME_CONSTANTS.themed.border}`}
          >
            <Heading
              level={3}
              className={`font-semibold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              {t("title")}
              {unreadCount > 0 && (
                <Span className="ml-2 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} {t("unread")}
                </Span>
              )}
            </Heading>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="text-xs text-primary hover:underline font-medium disabled:opacity-50"
              >
                {isMarkingAll ? tLoading("default") : t("markAllRead")}
              </Button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className={`${flex.center} py-10`}>
                <Spinner size="md" />
              </div>
            ) : notifications.length === 0 ? (
              <div className={`${flex.centerCol} py-10 px-4 text-center`}>
                <svg
                  className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3"
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
                <Text
                  className={`font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
                >
                  {t("empty")}
                </Text>
                <Text
                  size="sm"
                  className={`mt-1 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  {t("emptyDesc")}
                </Text>
              </div>
            ) : (
              <Ul>
                {notifications.map(
                  (n: NotificationDocument & { id: string }) => (
                    <Li
                      key={n.id}
                      className={`group flex items-start gap-3 px-4 py-3 border-b ${THEME_CONSTANTS.themed.border} last:border-0 transition-colors hover:${THEME_CONSTANTS.themed.bgSecondary} ${
                        !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      {/* Icon */}
                      <Span className="text-xl flex-shrink-0 mt-0.5">
                        {NOTIFICATION_TYPE_ICONS[n.type] ?? "🔔"}
                      </Span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`${flex.betweenStart} gap-2`}>
                          <Text
                            size="sm"
                            className={`font-medium ${THEME_CONSTANTS.themed.textPrimary} leading-tight`}
                          >
                            {n.title}
                            {!n.isRead && (
                              <Span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-primary flex-shrink-0 align-middle" />
                            )}
                          </Text>
                          <Span
                            className={`text-xs ${THEME_CONSTANTS.themed.textSecondary} flex-shrink-0`}
                          >
                            {formatRelativeTime(n.createdAt)}
                          </Span>
                        </div>
                        <Text
                          size="sm"
                          className={`${THEME_CONSTANTS.themed.textSecondary} mt-0.5 line-clamp-2`}
                        >
                          {n.message}
                        </Text>

                        <div className={`${flex.rowCenter} gap-3 mt-1.5`}>
                          {n.actionUrl && (
                            <TextLink
                              href={n.actionUrl}
                              onClick={() => {
                                if (!n.isRead) handleMarkRead(n.id);
                                setIsOpen(false);
                              }}
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              {n.actionLabel ?? tActions("view")}
                            </TextLink>
                          )}
                          {!n.isRead && (
                            <Button
                              variant="ghost"
                              onClick={() => handleMarkRead(n.id)}
                              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline p-0 h-auto"
                            >
                              {t("markRead")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Li>
                  ),
                )}
              </Ul>
            )}
          </div>

          {/* Footer */}
          <div
            className={`px-4 py-3 border-t ${THEME_CONSTANTS.themed.border} text-center`}
          >
            <TextLink
              href={ROUTES.USER.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {t("viewAll")}
            </TextLink>
          </div>
        </div>
      )}
    </div>
  );
}

