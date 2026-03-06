"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

export const REVIEW_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-rating", label: "Rating: High to Low" },
  { value: "rating", label: "Rating: Low to High" },
  { value: "-helpfulCount", label: "Most Helpful" },
  { value: "-reportCount", label: "Most Reported" },
  { value: "userName", label: "Customer A–Z" },
  { value: "productTitle", label: "Product A–Z" },
] as const;

export interface ReviewFiltersProps {
  table: UrlTable;
}

export function ReviewFilters({ table }: ReviewFiltersProps) {
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

  const verifiedOptions = [
    { value: "true", label: t("booleanVerified") },
    { value: "false", label: t("booleanUnverified") },
  ];

  const featuredOptions = [
    { value: "true", label: t("booleanFeatured") },
    { value: "false", label: t("booleanNotFeatured") },
  ];

  const selectedStatus = table.get("status") ? [table.get("status")] : [];
  const selectedRating = table.get("rating") ? [table.get("rating")] : [];
  const selectedVerified = table.get("verified") ? [table.get("verified")] : [];
  const selectedFeatured = table.get("featured") ? [table.get("featured")] : [];

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
        title={t("rating")}
        options={ratingOptions}
        selected={selectedRating}
        onChange={(vals) => table.set("rating", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("verified")}
        options={verifiedOptions}
        selected={selectedVerified}
        onChange={(vals) => table.set("verified", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("featured")}
        options={featuredOptions}
        selected={selectedFeatured}
        onChange={(vals) => table.set("featured", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
