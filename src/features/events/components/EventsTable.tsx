"use client";

import { useTranslations } from "next-intl";
import { formatDate } from "@/utils";
import { Caption, Text, Badge, Button } from "@mohasinac/appkit/ui";

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
        header: t("form.titleLabel"),
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
        header: t("colType"),
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
        header: tTable("status"),
        sortable: true,
        width: "10%",
        render: (e: EventDocument) => <EventStatusBadge status={e.status} />,
      },
      {
        key: "startsAt",
        header: t("colStarts"),
        sortable: true,
        width: "14%",
        render: (e: EventDocument) => (
          <Text size="sm" variant="secondary">
            {e.startsAt ? formatDate(e.startsAt) : "—"}
          </Text>
        ),
      },
      {
        key: "endsAt",
        header: t("colEnds"),
        sortable: true,
        width: "14%",
        render: (e: EventDocument) => (
          <Text size="sm" variant="secondary">
            {e.endsAt ? formatDate(e.endsAt) : "—"}
          </Text>
        ),
      },
      {
        key: "totalEntries",
        header: t("entries"),
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
