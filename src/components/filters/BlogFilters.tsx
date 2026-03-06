"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

export const BLOG_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "title", label: "Title A–Z" },
  { value: "-title", label: "Title Z–A" },
  { value: "-views", label: "Most Viewed" },
  { value: "-readTimeMinutes", label: "Longest Read" },
  { value: "-publishedAt", label: "Published: Newest" },
  { value: "publishedAt", label: "Published: Oldest" },
] as const;

export interface BlogFiltersProps {
  table: UrlTable;
}

export function BlogFilters({ table }: BlogFiltersProps) {
  const t = useTranslations("filters");

  const statusOptions = [
    { value: "draft", label: t("blogStatusDraft") },
    { value: "published", label: t("blogStatusPublished") },
    { value: "archived", label: t("blogStatusArchived") },
  ];

  const categoryOptions = [
    { value: "news", label: t("blogCategoryNews") },
    { value: "tips", label: t("blogCategoryTips") },
    { value: "guides", label: t("blogCategoryGuides") },
    { value: "updates", label: t("blogCategoryUpdates") },
    { value: "community", label: t("blogCategoryCommunity") },
  ];

  const featuredOptions = [
    { value: "true", label: t("booleanFeatured") },
    { value: "false", label: t("booleanNotFeatured") },
  ];

  const selectedStatus = table.get("status") ? [table.get("status")] : [];
  const selectedCategory = table.get("category") ? [table.get("category")] : [];
  const selectedFeatured = table.get("isFeatured")
    ? [table.get("isFeatured")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("status")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("status", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("category")}
        options={categoryOptions}
        selected={selectedCategory}
        onChange={(vals) => table.set("category", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isFeatured")}
        options={featuredOptions}
        selected={selectedFeatured}
        onChange={(vals) => table.set("isFeatured", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
