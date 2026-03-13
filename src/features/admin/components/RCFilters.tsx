"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const RC_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-amount", label: "Highest Amount" },
  { value: "amount", label: "Lowest Amount" },
] as const;

export interface RCFiltersProps {
  table: UrlTable;
}

export function RCFilters({ table }: RCFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "type",
      title: t("type"),
      options: [
        { value: "purchase", label: t("rcTypePurchase") },
        { value: "engage", label: t("rcTypeEngage") },
        { value: "release", label: t("rcTypeRelease") },
        { value: "forfeit", label: t("rcTypeForfeit") },
        { value: "return", label: t("rcTypeReturn") },
        { value: "admin_grant", label: t("rcTypeAdminGrant") },
        { value: "admin_deduct", label: t("rcTypeAdminDeduct") },
      ],
      defaultCollapsed: false,
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
