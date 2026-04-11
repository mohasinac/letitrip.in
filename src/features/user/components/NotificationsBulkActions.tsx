"use client";

import { useTranslations } from "next-intl";
import { Heading, Text, Button } from "@mohasinac/appkit/ui";

import { THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;

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
    <div className={flex.between}>
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
        <Button
          variant="ghost"
          onClick={onMarkAllRead}
          disabled={isMarkingAll}
          className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
        >
          {isMarkingAll ? tLoading("saving") : tNotifications("markAllRead")}
        </Button>
      )}
    </div>
  );
}
