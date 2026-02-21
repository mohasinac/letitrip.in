"use client";

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  /** Currently selected sort value */
  value: string;
  /** Called when the user picks a new sort option */
  onChange: (value: string) => void;
  /** Available sort options */
  options: SortOption[];
  /** Label shown before the select. Defaults to UI_LABELS.TABLE.SORT_BY */
  label?: string;
  /** Extra class names on the wrapper div */
  className?: string;
}

/**
 * SortDropdown
 *
 * Labelled sort select control. Tier-1 shared primitive — not admin-specific.
 * Used on admin list pages, seller pages, and any public list page.
 *
 * @example
 * ```tsx
 * <SortDropdown
 *   value={table.get('sort')}
 *   onChange={table.setSort}
 *   options={[
 *     { value: '-createdAt', label: 'Newest first' },
 *     { value: 'price',      label: 'Price: low → high' },
 *     { value: '-price',     label: 'Price: high → low' },
 *   ]}
 * />
 * ```
 */
export function SortDropdown({
  value,
  onChange,
  options,
  label,
  className = "",
}: SortDropdownProps) {
  const displayLabel = label ?? UI_LABELS.TABLE.SORT_BY;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label
        htmlFor="sort-dropdown"
        className={`text-sm font-medium whitespace-nowrap ${THEME_CONSTANTS.themed.textSecondary}`}
      >
        {displayLabel}
      </label>
      <select
        id="sort-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`text-sm ${THEME_CONSTANTS.input.base}`}
        aria-label={displayLabel}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
