"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

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

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "type",
      title: t("type"),
      options: [
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
      ],
      defaultCollapsed: false,
    },
    {
      type: "facet-single",
      key: "enabled",
      title: t("enabled"),
      options: [
        { value: "true", label: t("booleanEnabled") },
        { value: "false", label: t("booleanDisabled") },
      ],
    },
  ];

  return <FilterPanel config={config} table={table} />;
}

