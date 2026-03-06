"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import type { UrlTable } from "./ProductFilters";

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

  const isActiveOptions = [
    { value: "true", label: t("booleanActive") },
    { value: "false", label: t("booleanInactive") },
  ];

  const selectedType = table.get("type") ? [table.get("type")] : [];
  const selectedIsActive = table.get("validityIsActive")
    ? [table.get("validityIsActive")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("type")}
        options={typeOptions}
        selected={selectedType}
        onChange={(vals) => table.set("type", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isActive")}
        options={isActiveOptions}
        selected={selectedIsActive}
        onChange={(vals) => table.set("validityIsActive", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
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
