"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const COUPON_SORT_OPTIONS = [
  { value: "code", label: "Code A–Z" },
  { value: "-code", label: "Code Z–A" },
  { value: "name", label: "Name A–Z" },
  { value: "-discount.value", label: "Highest Discount" },
  { value: "discount.value", label: "Lowest Discount" },
  { value: "-validity.endDate", label: "Expires Latest" },
  { value: "validity.endDate", label: "Expires Soonest" },
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
] as const;

export interface CouponFiltersProps {
  table: UrlTable;
}

export function CouponFilters({ table }: CouponFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-multi",
      key: "type",
      title: t("type"),
      options: [
        { value: "percentage", label: t("couponTypePercentage") },
        { value: "fixed", label: t("couponTypeFixed") },
        { value: "free_shipping", label: t("couponTypeFreeShipping") },
        { value: "buy_x_get_y", label: t("couponTypeBuyXGetY") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "switch",
      key: "validityIsActive",
      title: t("isActive"),
      label: t("showActiveOnly"),
    },
    {
      type: "range-date",
      fromKey: "dateFrom",
      toKey: "dateTo",
      title: t("dateRange"),
      minPlaceholder: t("minDate"),
      maxPlaceholder: t("maxDate"),
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
