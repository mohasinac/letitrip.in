"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const NEWSLETTER_SORT_OPTIONS = [
  { value: "email", label: "Email A–Z" },
  { value: "-email", label: "Email Z–A" },
  { value: "-subscribedAt", label: "Most Recent" },
  { value: "subscribedAt", label: "Oldest First" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface NewsletterFiltersProps {
  table: UrlTable;
}

export function NewsletterFilters({ table }: NewsletterFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "status",
      title: t("status"),
      options: [
        { value: "active", label: t("newsletterStatusActive") },
        { value: "unsubscribed", label: t("newsletterStatusUnsubscribed") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "facet-single",
      key: "source",
      title: t("source"),
      options: [
        { value: "footer", label: t("newsletterSourceFooter") },
        { value: "homepage", label: t("newsletterSourceHomepage") },
        { value: "checkout", label: t("newsletterSourceCheckout") },
        { value: "popup", label: t("newsletterSourcePopup") },
        { value: "admin", label: t("newsletterSourceAdmin") },
        { value: "import", label: t("newsletterSourceImport") },
      ],
    },
  ];

  return <FilterPanel config={config} table={table} />;
}

