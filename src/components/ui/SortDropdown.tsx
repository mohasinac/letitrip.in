"use client";

import { useTranslations } from "next-intl";
import { Select, Span } from "@/components";

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
        <Span className="text-sm text-gray-500 whitespace-nowrap">
          {displayLabel}
        </Span>
      )}
      <Select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        options={options}
      />
    </div>
  );
}
