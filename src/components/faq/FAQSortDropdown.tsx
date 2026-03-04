"use client";

import { THEME_CONSTANTS } from "@/constants";
import { Span } from "../typography/Typography";
import SelectField from "../forms/Select";

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
      <Span
        className={`${THEME_CONSTANTS.typography.body} text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        Sort by:
      </Span>
      <SelectField
        value={selectedSort}
        onChange={(e) => onSortChange(e.target.value as FAQSortOption)}
        options={Object.entries(SORT_OPTIONS).map(([v, l]) => ({
          value: v,
          label: l,
        }))}
      />
    </div>
  );
}
