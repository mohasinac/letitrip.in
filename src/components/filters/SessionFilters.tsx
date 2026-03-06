"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

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

  const isActiveOptions = [
    { value: "true", label: t("booleanActive") },
    { value: "false", label: t("booleanInactive") },
  ];

  const selectedIsActive = table.get("isActive") ? [table.get("isActive")] : [];

  return (
    <div>
      <FilterFacetSection
        title={t("isActive")}
        options={isActiveOptions}
        selected={selectedIsActive}
        onChange={(vals) => table.set("isActive", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />
    </div>
  );
}
