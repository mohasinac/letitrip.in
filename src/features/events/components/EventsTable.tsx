"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { Button } from "@/components";
import { EventStatusBadge } from "./EventStatusBadge";
import type { EventDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

export function useEventsTableColumns(
  onEdit: (event: EventDocument) => void,
  onEntries: (event: EventDocument) => void,
  onDelete: (event: EventDocument) => void,
) {
  const t = useTranslations("adminEvents");
  const tTable = useTranslations("table");
  const tActions = useTranslations("actions");

  return {
    columns: [
      {
        key: "title",
        header: "Title",
        sortable: true,
        width: "30%",
        render: (e: EventDocument) => (
          <div>
            <p className="font-medium text-sm">{e.title}</p>
            {e.description && (
              <p
                className={`text-xs mt-0.5 ${themed.textSecondary} truncate max-w-xs`}
              >
                {e.description}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        sortable: true,
        width: "10%",
        render: (e: EventDocument) => (
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
            {e.type}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        width: "10%",
        render: (e: EventDocument) => <EventStatusBadge status={e.status} />,
      },
      {
        key: "startsAt",
        header: "Starts",
        sortable: true,
        width: "14%",
        render: (e: EventDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {e.startsAt ? formatDate(e.startsAt as unknown as string) : "—"}
          </p>
        ),
      },
      {
        key: "endsAt",
        header: "Ends",
        sortable: true,
        width: "14%",
        render: (e: EventDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {e.endsAt ? formatDate(e.endsAt as unknown as string) : "—"}
          </p>
        ),
      },
      {
        key: "totalEntries",
        header: "Entries",
        sortable: false,
        width: "8%",
        render: (e: EventDocument) => (
          <p className="text-sm font-semibold text-center">
            {e.stats.totalEntries}
          </p>
        ),
      },
      {
        key: "actions",
        header: tTable("actions"),
        width: "14%",
        render: (e: EventDocument) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(e)}>
              {tActions("edit")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEntries(e)}>
              {t("entries")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(e)}
            >
              {tActions("delete")}
            </Button>
          </div>
        ),
      },
    ],
  };
}
