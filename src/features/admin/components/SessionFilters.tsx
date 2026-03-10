"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const SESSION_SORT_OPTIONS = [
  { value: "-lastActivity", label: "Most Recent Activity" },
  { value: "lastActivity", label: "Least Recent Activity" },
  { value: "-expiresAt", label: "Expires Latest" },
  { value: "expiresAt", label: "Expires Soonest" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface SessionFiltersProps {
  table: UrlTable;
}

export function SessionFilters({ table }: SessionFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "isActive",
      title: t("isActive"),
      options: [
        { value: "true", label: t("booleanActive") },
        { value: "false", label: t("booleanInactive") },
      ],
      defaultCollapsed: false,
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
