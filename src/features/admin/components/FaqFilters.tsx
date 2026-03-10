"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

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

  const config: FilterConfig[] = [
    {
      type: "facet-multi",
      key: "category",
      title: t("category"),
      options: [
        { value: "general", label: t("faqCategoryGeneral") },
        { value: "products", label: t("faqCategoryProducts") },
        { value: "shipping", label: t("faqCategoryShipping") },
        { value: "returns", label: t("faqCategoryReturns") },
        { value: "payment", label: t("faqCategoryPayment") },
        { value: "account", label: t("faqCategoryAccount") },
        { value: "sellers", label: t("faqCategorySellers") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "switch",
      key: "isActive",
      title: t("isActive"),
      label: t("showActiveOnly"),
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
