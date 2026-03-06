"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

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

  const tierOptions = [
    { value: "1", label: t("tierTopLevel") },
    { value: "2", label: t("tierSubCategory") },
    { value: "3", label: t("tierLeafCategory") },
  ];

  const isActiveOptions = [
    { value: "true", label: t("booleanActive") },
    { value: "false", label: t("booleanInactive") },
  ];

  const isFeaturedOptions = [
    { value: "true", label: t("booleanFeatured") },
    { value: "false", label: t("booleanNotFeatured") },
  ];

  const isSearchableOptions = [
    { value: "true", label: t("booleanTrue") },
    { value: "false", label: t("booleanFalse") },
  ];

  const isLeafOptions = [
    { value: "true", label: t("booleanTrue") },
    { value: "false", label: t("booleanFalse") },
  ];

  const selectedTier = table.get("tier") ? [table.get("tier")] : [];
  const selectedIsActive = table.get("isActive") ? [table.get("isActive")] : [];
  const selectedIsFeatured = table.get("isFeatured")
    ? [table.get("isFeatured")]
    : [];
  const selectedIsSearchable = table.get("isSearchable")
    ? [table.get("isSearchable")]
    : [];
  const selectedIsLeaf = table.get("isLeaf") ? [table.get("isLeaf")] : [];

  return (
    <div>
      <FilterFacetSection
        title={t("tier")}
        options={tierOptions}
        selected={selectedTier}
        onChange={(vals) => table.set("tier", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isActive")}
        options={isActiveOptions}
        selected={selectedIsActive}
        onChange={(vals) => table.set("isActive", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isFeatured")}
        options={isFeaturedOptions}
        selected={selectedIsFeatured}
        onChange={(vals) => table.set("isFeatured", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isSearchable")}
        options={isSearchableOptions}
        selected={selectedIsSearchable}
        onChange={(vals) => table.set("isSearchable", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isLeaf")}
        options={isLeafOptions}
        selected={selectedIsLeaf}
        onChange={(vals) => table.set("isLeaf", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
