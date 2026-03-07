"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

export const HOMEPAGE_SECTION_SORT_OPTIONS = [
  { value: "order", label: "Display Order" },
  { value: "-order", label: "Reverse Order" },
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-updatedAt", label: "Recently Updated" },
] as const;

export interface HomepageSectionFiltersProps {
  table: UrlTable;
}

export function HomepageSectionFilters({ table }: HomepageSectionFiltersProps) {
  const t = useTranslations("filters");

  const typeOptions = [
    { value: "welcome", label: t("sectionTypeWelcome") },
    { value: "trust_indicators", label: t("sectionTypeTrustIndicators") },
    { value: "categories", label: t("sectionTypeCategories") },
    { value: "brands", label: t("sectionTypeBrands") },
    { value: "products", label: t("sectionTypeProducts") },
    { value: "auctions", label: t("sectionTypeAuctions") },
    { value: "banner", label: t("sectionTypeBanner") },
    { value: "features", label: t("sectionTypeFeatures") },
    { value: "reviews", label: t("sectionTypeReviews") },
    { value: "whatsapp", label: t("sectionTypeWhatsapp") },
    { value: "faq", label: t("sectionTypeFaq") },
    { value: "blog_articles", label: t("sectionTypeBlogArticles") },
    { value: "newsletter", label: t("sectionTypeNewsletter") },
  ];

  const enabledOptions = [
    { value: "true", label: t("booleanEnabled") },
    { value: "false", label: t("booleanDisabled") },
  ];

  const selectedType = table.get("type") ? [table.get("type")] : [];
  const selectedEnabled = table.get("enabled") ? [table.get("enabled")] : [];

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
        title={t("enabled")}
        options={enabledOptions}
        selected={selectedEnabled}
        onChange={(vals) => table.set("enabled", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
