"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { SwitchFilter } from "./SwitchFilter";
import type { UrlTable } from "./ProductFilters";

export const REVIEW_SORT_OPTIONS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
  { value: "-rating", key: "sortHighestRated" },
  { value: "rating", key: "sortLowestRated" },
] as const;

export interface ReviewFiltersProps {
  table: UrlTable;
  /** "admin" (default) shows status, rating, verified, featured.
   *  "public" shows rating only. */
  variant?: "admin" | "public";
}

export function ReviewFilters({
  table,
  variant = "admin",
}: ReviewFiltersProps) {
  const t = useTranslations("filters");

  const statusOptions = [
    { value: "pending", label: t("reviewStatusPending") },
    { value: "approved", label: t("reviewStatusApproved") },
    { value: "rejected", label: t("reviewStatusRejected") },
  ];

  const ratingOptions = [
    { value: "5", label: t("rating5Stars") },
    { value: "4", label: t("rating4Stars") },
    { value: "3", label: t("rating3Stars") },
    { value: "2", label: t("rating2Stars") },
    { value: "1", label: t("rating1Star") },
  ];

  const selectedStatus = table.get("status")
    ? table.get("status").split("|").filter(Boolean)
    : [];
  const selectedRating = table.get("rating")
    ? table.get("rating").split("|").filter(Boolean)
    : [];

  return (
    <div>
      {variant === "admin" && (
        <FilterFacetSection
          title={t("status")}
          options={statusOptions}
          selected={selectedStatus}
          onChange={(vals) => table.set("status", vals.join("|"))}
          searchable={false}
          defaultCollapsed={false}
        />
      )}

      <FilterFacetSection
        title={t("rating")}
        options={ratingOptions}
        selected={selectedRating}
        onChange={(vals) => table.set("rating", vals.join("|"))}
        searchable={false}
        defaultCollapsed={variant === "admin"}
      />

      {variant === "admin" && (
        <>
          <SwitchFilter
            title={t("verified")}
            label={t("showVerifiedOnly")}
            checked={table.get("verified") === "true"}
            onChange={(v) => table.set("verified", v ? "true" : "")}
            defaultCollapsed={true}
          />

          <SwitchFilter
            title={t("featured")}
            label={t("showFeaturedOnly")}
            checked={table.get("featured") === "true"}
            onChange={(v) => table.set("featured", v ? "true" : "")}
            defaultCollapsed={true}
          />
        </>
      )}
    </div>
  );
}
