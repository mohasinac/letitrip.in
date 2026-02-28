"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

const { themed, typography } = THEME_CONSTANTS;

interface NotificationsBulkActionsProps {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllRead: () => void;
}

export function NotificationsBulkActions({
  unreadCount,
  isMarkingAll,
  onMarkAllRead,
}: NotificationsBulkActionsProps) {
  const tNotifications = useTranslations("notifications");
  const tLoading = useTranslations("loading");
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {tNotifications("title")}
        </h1>
        {unreadCount > 0 && (
          <p className={`mt-1 text-sm ${themed.textSecondary}`}>
            {unreadCount} {tNotifications("unread").toLowerCase()} notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          disabled={isMarkingAll}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
        >
          {isMarkingAll ? tLoading("saving") : tNotifications("markAllRead")}
        </button>
      )}
    </div>
  );
}
