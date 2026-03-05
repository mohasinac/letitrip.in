"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Span } from "../typography/Typography";
import SelectField from "../forms/Select";

export type FAQSortOption = "helpful" | "newest" | "alphabetical";

interface FAQSortDropdownProps {
  selectedSort: FAQSortOption;
  onSortChange: (sort: FAQSortOption) => void;
}

export function FAQSortDropdown({
  selectedSort,
  onSortChange,
}: FAQSortDropdownProps) {
  const t = useTranslations("faq.sort");

  const sortOptions: { value: FAQSortOption; label: string }[] = [
    { value: "helpful", label: t("helpful") },
    { value: "newest", label: t("newest") },
    { value: "alphabetical", label: t("alphabetical") },
  ];

  return (
    <div className="flex items-center gap-3">
      <Span
        className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        {t("label")}
      </Span>
      <SelectField
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as FAQSortOption)}
        options={sortOptions}
      />
    </div>
  );
}
