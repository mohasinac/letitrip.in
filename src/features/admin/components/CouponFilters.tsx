"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection, RangeFilter, SwitchFilter } from "@/components";
import type { UrlTable } from "@/components";

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

  const typeOptions = [
    { value: "percentage", label: t("couponTypePercentage") },
    { value: "fixed", label: t("couponTypeFixed") },
    { value: "free_shipping", label: t("couponTypeFreeShipping") },
    { value: "buy_x_get_y", label: t("couponTypeBuyXGetY") },
  ];

  const selectedType = table.get("type")
    ? table.get("type").split("|").filter(Boolean)
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("type")}
        options={typeOptions}
        selected={selectedType}
        onChange={(vals) => table.set("type", vals.join("|"))}
        searchable={false}
        defaultCollapsed={false}
      />

      <SwitchFilter
        title={t("isActive")}
        label={t("showActiveOnly")}
        checked={table.get("validityIsActive") === "true"}
        onChange={(v) => table.set("validityIsActive", v ? "true" : "")}
        defaultCollapsed={true}
      />

      <RangeFilter
        title={t("dateRange")}
        type="date"
        minValue={table.get("dateFrom")}
        maxValue={table.get("dateTo")}
        onMinChange={(v) => table.set("dateFrom", v)}
        onMaxChange={(v) => table.set("dateTo", v)}
        minPlaceholder={t("minDate")}
        maxPlaceholder={t("maxDate")}
        defaultCollapsed={true}
      />
    </div>
  );
}
