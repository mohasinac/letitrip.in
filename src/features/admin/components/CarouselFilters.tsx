"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

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

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "active",
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
