"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "@/components";

export const EVENT_ENTRY_SORT_OPTIONS = [
  { value: "-submittedAt", label: "Most Recent" },
  { value: "submittedAt", label: "Oldest First" },
  { value: "-points", label: "Highest Points" },
  { value: "points", label: "Lowest Points" },
  { value: "userDisplayName", label: "User Name A–Z" },
] as const;

export interface EventEntryFiltersProps {
  table: UrlTable;
}

export function EventEntryFilters({ table }: EventEntryFiltersProps) {
  const t = useTranslations("filters");

  const reviewStatusOptions = [
    { value: "pending", label: t("entryStatusPending") },
    { value: "approved", label: t("entryStatusApproved") },
    { value: "flagged", label: t("entryStatusFlagged") },
  ];

  const selectedReviewStatus = table.get("reviewStatus")
    ? [table.get("reviewStatus")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("entryReviewStatus")}
        options={reviewStatusOptions}
        selected={selectedReviewStatus}
        onChange={(vals) => table.set("reviewStatus", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />
    </div>
  );
}
