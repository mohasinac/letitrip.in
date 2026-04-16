"use client";
import { Text, Button, Span, Badge, Row } from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatRelativeTime } from "@mohasinac/appkit/utils";


import type { NotificationDocument } from "@/db/schema";

const { themed, flex } = THEME_CONSTANTS;

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  order_placed: "???",
  order_confirmed: "?",
  order_shipped: "??",
  order_delivered: "??",
  order_cancelled: "?",
  bid_placed: "??",
  bid_outbid: "?",
  bid_won: "??",
  bid_lost: "??",
  review_approved: "?",
  review_replied: "??",
  product_available: "??",
  promotion: "???",
  system: "??",
  welcome: "??",
};

interface NotificationItemProps {
  notification: NotificationDocument;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const tNotifications = useTranslations("notifications");
  const tActions = useTranslations("actions");
  return (
    <div
      className={`flex items-start gap-4 p-4 transition-colors ${
        !n.isRead ? "bg-primary/5 dark:bg-primary/10" : themed.bgPrimary
      }`}
    >
      {/* Type icon */}
      <Span className="text-2xl flex-shrink-0 mt-0.5">
        {NOTIFICATION_TYPE_ICONS[n.type] ?? "??"}
      </Span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`${flex.betweenStart} gap-3`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text weight="semibold" size="sm">
                {n.title}
              </Text>
              {!n.isRead && (
                <Badge variant="info">{tNotifications("newBadge")}</Badge>
              )}
            </div>
            <Text size="sm" variant="secondary" className="mt-0.5">
              {n.message}
            </Text>
            <Text size="xs" variant="secondary" className="mt-1.5">
              {formatRelativeTime(n.createdAt)}
            </Text>
          </div>

          {/* Actions */}
          <Row gap="sm" className="flex-shrink-0">
            {!n.isRead && (
              <Button
                variant="ghost"
                onClick={() => onMarkRead(n.id)}
                title={tNotifications("markRead")}
                aria-label={tNotifications("markRead")}
                className="p-1.5 rounded-lg text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
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
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => onDelete(n.id)}
              title={tNotifications("deleted")}
              aria-label={tNotifications("deleted")}
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
            </Button>
          </Row>
        </div>

        {/* Action link */}
        {n.actionUrl && (
          <TextLink
            href={n.actionUrl}
            variant="bare"
            onClick={() => {
              if (!n.isRead) onMarkRead(n.id);
            }}
            className="inline-block mt-2 text-xs text-primary hover:underline font-medium"
          >
            {n.actionLabel ?? tActions("view")} ?
          </TextLink>
        )}
      </div>
    </div>
  );
}

