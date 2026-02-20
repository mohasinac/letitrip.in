"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

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
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {UI_LABELS.NOTIFICATIONS.TITLE}
        </h1>
        {unreadCount > 0 && (
          <p className={`mt-1 text-sm ${themed.textSecondary}`}>
            {unreadCount} {UI_LABELS.NOTIFICATIONS.UNREAD.toLowerCase()}{" "}
            notification{unreadCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllRead}
          disabled={isMarkingAll}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline disabled:opacity-50"
        >
          {isMarkingAll
            ? UI_LABELS.LOADING.SAVING
            : UI_LABELS.NOTIFICATIONS.MARK_ALL_READ}
        </button>
      )}
    </div>
  );
}
