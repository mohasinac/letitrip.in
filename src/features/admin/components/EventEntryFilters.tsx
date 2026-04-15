"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

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

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "reviewStatus",
      title: t("entryReviewStatus"),
      options: [
        { value: "pending", label: t("entryStatusPending") },
        { value: "approved", label: t("entryStatusApproved") },
        { value: "flagged", label: t("entryStatusFlagged") },
      ],
      defaultCollapsed: false,
    },
  ];

  return <FilterPanel config={config} table={table} />;
}

