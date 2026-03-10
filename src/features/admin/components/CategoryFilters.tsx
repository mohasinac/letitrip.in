"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const CATEGORY_SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "order", label: "Display Order" },
  { value: "tier", label: "Tier (Top first)" },
  { value: "-metrics.productCount", label: "Most Products" },
  { value: "-metrics.totalItemCount", label: "Most Items" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface CategoryFiltersProps {
  table: UrlTable;
}

export function CategoryFilters({ table }: CategoryFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "tier",
      title: t("tier"),
      options: [
        { value: "1", label: t("tierTopLevel") },
        { value: "2", label: t("tierSubCategory") },
        { value: "3", label: t("tierLeafCategory") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "facet-single",
      key: "isActive",
      title: t("isActive"),
      options: [
        { value: "true", label: t("booleanActive") },
        { value: "false", label: t("booleanInactive") },
      ],
    },
    {
      type: "facet-single",
      key: "isFeatured",
      title: t("isFeatured"),
      options: [
        { value: "true", label: t("booleanFeatured") },
        { value: "false", label: t("booleanNotFeatured") },
      ],
    },
    {
      type: "facet-single",
      key: "isSearchable",
      title: t("isSearchable"),
      options: [
        { value: "true", label: t("booleanTrue") },
        { value: "false", label: t("booleanFalse") },
      ],
    },
    {
      type: "facet-single",
      key: "isLeaf",
      title: t("isLeaf"),
      options: [
        { value: "true", label: t("booleanTrue") },
        { value: "false", label: t("booleanFalse") },
      ],
    },
    {
      type: "facet-single",
      key: "isBrand",
      title: t("isBrand"),
      options: [
        { value: "true", label: t("booleanFeatured") },
        { value: "false", label: t("booleanNotFeatured") },
      ],
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
