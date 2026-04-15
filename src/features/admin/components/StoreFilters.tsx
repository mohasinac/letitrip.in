"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const STORE_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "displayName", label: "Name A–Z" },
  { value: "-displayName", label: "Name Z–A" },
  { value: "storeStatus", label: "Status" },
] as const;

export interface StoreFiltersProps {
  table: UrlTable;
}

export function StoreFilters({ table }: StoreFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "storeStatus",
      title: t("storeStatus"),
      options: [
        { value: "pending", label: t("storeStatusPending") },
        { value: "approved", label: t("storeStatusApproved") },
        { value: "rejected", label: t("storeStatusRejected") },
      ],
      defaultCollapsed: false,
    },
  ];

  return <FilterPanel config={config} table={table} />;
}

