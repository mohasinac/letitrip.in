"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "@/components";

export const CAROUSEL_SORT_OPTIONS = [
  { value: "order", label: "Display Order" },
  { value: "-order", label: "Reverse Order" },
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-updatedAt", label: "Recently Updated" },
] as const;

export interface CarouselFiltersProps {
  table: UrlTable;
}

export function CarouselFilters({ table }: CarouselFiltersProps) {
  const t = useTranslations("filters");

  const activeOptions = [
    { value: "true", label: t("booleanActive") },
    { value: "false", label: t("booleanInactive") },
  ];

  const selectedActive = table.get("active") ? [table.get("active")] : [];

  return (
    <div>
      <FilterFacetSection
        title={t("isActive")}
        options={activeOptions}
        selected={selectedActive}
        onChange={(vals) => table.set("active", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />
    </div>
  );
}
