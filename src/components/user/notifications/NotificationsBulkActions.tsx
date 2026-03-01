"use client";

import { useTranslations } from "next-intl";
import { Heading, Text } from "@/components";

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
        <Heading level={1}>{tNotifications("title")}</Heading>
        {unreadCount > 0 && (
          <Text size="sm" variant="secondary" className="mt-1">
            {unreadCount} {tNotifications("unread").toLowerCase()} notification
            {unreadCount !== 1 ? "s" : ""}
          </Text>
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
