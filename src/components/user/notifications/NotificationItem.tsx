"use client";

import { Badge } from "@/components/ui";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatRelativeTime } from "@/utils";
import type { NotificationDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

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
  return (
    <div
      className={`flex items-start gap-4 p-4 transition-colors ${
        !n.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : themed.bgPrimary
      }`}
    >
      {/* Type icon */}
      <span className="text-2xl flex-shrink-0 mt-0.5">
        {NOTIFICATION_TYPE_ICONS[n.type] ?? "🔔"}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-semibold text-sm ${themed.textPrimary}`}>
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
                onClick={() => onMarkRead(n.id)}
                title={UI_LABELS.NOTIFICATIONS.MARK_READ}
                aria-label={UI_LABELS.NOTIFICATIONS.MARK_READ}
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
              onClick={() => onDelete(n.id)}
              title={UI_LABELS.NOTIFICATIONS.DELETE}
              aria-label={UI_LABELS.NOTIFICATIONS.DELETE}
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
              if (!n.isRead) onMarkRead(n.id);
            }}
            className="inline-block mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {n.actionLabel ?? UI_LABELS.ACTIONS.VIEW} →
          </a>
        )}
      </div>
    </div>
  );
}
