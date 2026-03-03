"use client";

import { useTranslations } from "next-intl";
import { formatDate } from "@/utils";
import { Button, Text, Caption, Badge } from "@/components";
import { EventStatusBadge } from "./EventStatusBadge";
import type { EventDocument } from "@/db/schema";

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
            <Text weight="medium" size="sm">
              {e.title}
            </Text>
            {e.description && (
              <Caption className="mt-0.5 truncate max-w-xs">
                {e.description}
              </Caption>
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
          <Badge variant="info" className="capitalize">
            {e.type}
          </Badge>
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
          <Text size="sm" variant="secondary">
            {e.startsAt ? formatDate(e.startsAt as unknown as string) : "—"}
          </Text>
        ),
      },
      {
        key: "endsAt",
        header: "Ends",
        sortable: true,
        width: "14%",
        render: (e: EventDocument) => (
          <Text size="sm" variant="secondary">
            {e.endsAt ? formatDate(e.endsAt as unknown as string) : "—"}
          </Text>
        ),
      },
      {
        key: "totalEntries",
        header: "Entries",
        sortable: false,
        width: "8%",
        render: (e: EventDocument) => (
          <Text weight="semibold" size="sm" className="text-center">
            {e.stats.totalEntries}
          </Text>
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
