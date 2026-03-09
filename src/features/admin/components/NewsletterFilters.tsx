"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "@/components";

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

  const statusOptions = [
    { value: "active", label: t("newsletterStatusActive") },
    { value: "unsubscribed", label: t("newsletterStatusUnsubscribed") },
  ];

  const sourceOptions = [
    { value: "footer", label: t("newsletterSourceFooter") },
    { value: "homepage", label: t("newsletterSourceHomepage") },
    { value: "checkout", label: t("newsletterSourceCheckout") },
    { value: "popup", label: t("newsletterSourcePopup") },
    { value: "admin", label: t("newsletterSourceAdmin") },
    { value: "import", label: t("newsletterSourceImport") },
  ];

  const selectedStatus = table.get("status") ? [table.get("status")] : [];
  const selectedSource = table.get("source") ? [table.get("source")] : [];

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
        title={t("source")}
        options={sourceOptions}
        selected={selectedSource}
        onChange={(vals) => table.set("source", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
