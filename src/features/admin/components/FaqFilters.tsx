"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const FAQ_SORT_OPTIONS = [
  { value: "question", label: "Question A–Z" },
  { value: "-question", label: "Question Z–A" },
  { value: "-stats.helpful,-priority,order", label: "Most Helpful" },
  { value: "-stats.notHelpful,-priority,order", label: "Most Not Helpful" },
  { value: "-priority,order", label: "Priority High to Low" },
  { value: "priority,order", label: "Priority Low to High" },
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
] as const;

export interface FaqFiltersProps {
  table: UrlTable;
}

export function FaqFilters({ table }: FaqFiltersProps) {
  const t = useTranslations("filters");
  const tAdmin = useTranslations("adminFaqs");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "category",
      title: t("category"),
      options: [
        { value: "general", label: tAdmin("categoryGeneral") },
        { value: "orders_payment", label: tAdmin("categoryOrdersPayment") },
        {
          value: "shipping_delivery",
          label: tAdmin("categoryShippingDelivery"),
        },
        { value: "returns_refunds", label: tAdmin("categoryReturnsRefunds") },
        {
          value: "product_information",
          label: tAdmin("categoryProductInfo"),
        },
        {
          value: "account_security",
          label: tAdmin("categoryAccountSecurity"),
        },
        {
          value: "technical_support",
          label: tAdmin("categoryTechSupport"),
        },
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

