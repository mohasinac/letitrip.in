"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

export const FAQ_SORT_OPTIONS = [
  { value: "question", label: "Question A–Z" },
  { value: "-question", label: "Question Z–A" },
  { value: "-stat.helpful", label: "Most Helpful" },
  { value: "-stat.notHelpful", label: "Most Not Helpful" },
  { value: "-stat.views", label: "Most Viewed" },
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
] as const;

export interface FaqFiltersProps {
  table: UrlTable;
}

export function FaqFilters({ table }: FaqFiltersProps) {
  const t = useTranslations("filters");

  const categoryOptions = [
    { value: "general", label: t("faqCategoryGeneral") },
    { value: "products", label: t("faqCategoryProducts") },
    { value: "shipping", label: t("faqCategoryShipping") },
    { value: "returns", label: t("faqCategoryReturns") },
    { value: "payment", label: t("faqCategoryPayment") },
    { value: "account", label: t("faqCategoryAccount") },
    { value: "sellers", label: t("faqCategorySellers") },
  ];

  const isActiveOptions = [
    { value: "true", label: t("booleanActive") },
    { value: "false", label: t("booleanInactive") },
  ];

  const selectedCategory = table.get("category") ? [table.get("category")] : [];
  const selectedIsActive = table.get("isActive") ? [table.get("isActive")] : [];

  return (
    <div>
      <FilterFacetSection
        title={t("category")}
        options={categoryOptions}
        selected={selectedCategory}
        onChange={(vals) => table.set("category", vals[0] ?? "")}
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
    </div>
  );
}
