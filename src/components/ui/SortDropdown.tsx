"use client";

import { useTranslations } from "next-intl";

export interface SortOption {
  label: string;
  value: string;
}

export interface SortDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  options: SortOption[];
  label?: string;
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  options,
  label,
  className = "",
}: SortDropdownProps) {
  const t = useTranslations("table");
  const displayLabel = label ?? t("sortBy");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {displayLabel && (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {displayLabel}
        </span>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
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
