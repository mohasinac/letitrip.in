"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

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

/**
 * StoreFilters
 *
 * Filter panel for the admin store approval list.
 * Surfaces store status (pending / approved / rejected) as a single-select
 * facet section, matching the visual style of all other *Filters components.
 */
export function StoreFilters({ table }: StoreFiltersProps) {
  const t = useTranslations("filters");

  const statusOptions = [
    { value: "pending", label: t("storeStatusPending") },
    { value: "approved", label: t("storeStatusApproved") },
    { value: "rejected", label: t("storeStatusRejected") },
  ];

  const selectedStatus = table.get("storeStatus")
    ? [table.get("storeStatus")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("storeStatus")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("storeStatus", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />
    </div>
  );
}
