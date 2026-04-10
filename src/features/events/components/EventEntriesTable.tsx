"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { Text } from "@mohasinac/appkit/ui";
import { Badge, Button } from "@/components";
import type { EventEntryDocument, EntryReviewStatus } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

const REVIEW_VARIANT: Record<
  EntryReviewStatus,
  "success" | "warning" | "danger" | "secondary"
> = {
  approved: "success",
  pending: "warning",
  flagged: "danger",
};

export function useEventEntriesTableColumns(
  onReview: (entry: EventEntryDocument) => void,
) {
  const t = useTranslations("adminEvents");
  const tTable = useTranslations("table");

  return {
    columns: [
      {
        key: "userId",
        header: t("colUser"),
        sortable: false,
        width: "25%",
        render: (e: EventEntryDocument) => (
          <div>
            <Text className="font-medium text-sm">
              {e.userDisplayName ?? e.userId ?? "Anonymous"}
            </Text>
            {e.userEmail && (
              <Text className={`text-xs mt-0.5 ${themed.textSecondary}`}>
                {e.userEmail}
              </Text>
            )}
          </div>
        ),
      },
      {
        key: "reviewStatus",
        header: tTable("status"),
        sortable: false,
        width: "12%",
        render: (e: EventEntryDocument) => (
          <Badge variant={REVIEW_VARIANT[e.reviewStatus]}>
            {e.reviewStatus}
          </Badge>
        ),
      },
      {
        key: "submittedAt",
        header: t("colSubmitted"),
        sortable: true,
        width: "16%",
        render: (e: EventEntryDocument) => (
          <Text className={`text-sm ${themed.textSecondary}`}>
            {formatDate(e.submittedAt)}
          </Text>
        ),
      },
      {
        key: "points",
        header: t("colPoints"),
        sortable: false,
        width: "8%",
        render: (e: EventEntryDocument) => (
          <Text className="text-sm font-semibold text-center">
            {e.points ?? 0}
          </Text>
        ),
      },
      {
        key: "actions",
        header: tTable("actions"),
        width: "12%",
        render: (e: EventEntryDocument) => (
          <Button variant="ghost" size="sm" onClick={() => onReview(e)}>
            {t("reviewEntry")}
          </Button>
        ),
      },
    ],
  };
}
