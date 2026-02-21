/**
 * NewsletterTableColumns
 * Path: src/components/admin/newsletter/NewsletterTableColumns.tsx
 *
 * Column definitions for the admin Newsletter DataTable.
 */

"use client";

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import { Button } from "@/components";
import type { NewsletterSubscriberDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.NEWSLETTER;
const { themed } = THEME_CONSTANTS;

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  unsubscribed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const SOURCE_STYLES: Record<string, string> = {
  homepage: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  checkout:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  footer:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  unknown: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function getNewsletterTableColumns(
  onToggleStatus: (subscriber: NewsletterSubscriberDocument) => void,
  onDelete: (subscriber: NewsletterSubscriberDocument) => void,
) {
  return {
    columns: [
      {
        key: "email",
        header: LABELS.COLUMN_EMAIL,
        sortable: true,
        width: "35%",
        render: (s: NewsletterSubscriberDocument) => (
          <p className="font-medium text-sm">{s.email}</p>
        ),
      },
      {
        key: "status",
        header: LABELS.COLUMN_STATUS,
        sortable: false,
        width: "14%",
        render: (s: NewsletterSubscriberDocument) => (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[s.status] ?? ""}`}
          >
            {s.status}
          </span>
        ),
      },
      {
        key: "source",
        header: LABELS.COLUMN_SOURCE,
        sortable: false,
        width: "13%",
        render: (s: NewsletterSubscriberDocument) => {
          const src = s.source ?? "unknown";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SOURCE_STYLES[src] ?? SOURCE_STYLES.unknown}`}
            >
              {src}
            </span>
          );
        },
      },
      {
        key: "createdAt",
        header: LABELS.COLUMN_SUBSCRIBED,
        sortable: true,
        width: "14%",
        render: (s: NewsletterSubscriberDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {formatDate(s.createdAt)}
          </p>
        ),
      },
      {
        key: "unsubscribedAt",
        header: LABELS.COLUMN_UNSUBSCRIBED_AT,
        sortable: true,
        width: "14%",
        render: (s: NewsletterSubscriberDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {s.unsubscribedAt ? formatDate(s.unsubscribedAt) : "—"}
          </p>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "10%",
        render: (s: NewsletterSubscriberDocument) => (
          <div className="flex gap-1 justify-end">
            <Button
              variant="ghost"
              onClick={() => onToggleStatus(s)}
              className="text-xs px-2 py-1 h-auto"
              title={
                s.status === "active"
                  ? LABELS.UNSUBSCRIBE_ACTION
                  : LABELS.RESUBSCRIBE_ACTION
              }
            >
              {s.status === "active"
                ? LABELS.UNSUBSCRIBE_ACTION
                : LABELS.RESUBSCRIBE_ACTION}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onDelete(s)}
              className="text-xs px-2 py-1 h-auto text-red-600 hover:text-red-700 dark:text-red-400"
            >
              {UI_LABELS.ACTIONS.DELETE}
            </Button>
          </div>
        ),
      },
    ],
  };
}
