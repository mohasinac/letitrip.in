"use client";

import { THEME_CONSTANTS } from "@/constants/theme";

export type FAQSortOption = "helpful" | "newest" | "alphabetical";

interface FAQSortDropdownProps {
  selectedSort: FAQSortOption;
  onSortChange: (sort: FAQSortOption) => void;
}

const SORT_OPTIONS: Record<FAQSortOption, string> = {
  helpful: "Most Helpful",
  newest: "Newest First",
  alphabetical: "A-Z",
};

export function FAQSortDropdown({
  selectedSort,
  onSortChange,
}: FAQSortDropdownProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        Sort by:
      </span>
      <select
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as FAQSortOption)}
        className={`${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.border} border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
      >
        {Object.entries(SORT_OPTIONS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
