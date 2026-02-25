"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { Button, Badge } from "@/components";
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
        header: "User",
        sortable: false,
        width: "25%",
        render: (e: EventEntryDocument) => (
          <div>
            <p className="font-medium text-sm">
              {e.userDisplayName ?? e.userId ?? "Anonymous"}
            </p>
            {e.userEmail && (
              <p className={`text-xs mt-0.5 ${themed.textSecondary}`}>
                {e.userEmail}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "reviewStatus",
        header: "Status",
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
        header: "Submitted",
        sortable: true,
        width: "16%",
        render: (e: EventEntryDocument) => (
          <p className={`text-sm ${themed.textSecondary}`}>
            {formatDate(e.submittedAt as unknown as string)}
          </p>
        ),
      },
      {
        key: "points",
        header: "Points",
        sortable: false,
        width: "8%",
        render: (e: EventEntryDocument) => (
          <p className="text-sm font-semibold text-center">{e.points ?? 0}</p>
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
