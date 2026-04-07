"use client";

import { useTranslations } from "next-intl";
import {
  SortDropdown as PackageSortDropdown,
  type SortDropdownProps as PackageSortDropdownProps,
  type SortOption,
} from "@mohasinac/ui";

interface SortDropdownProps extends Omit<PackageSortDropdownProps, "label"> {
  label?: string;
}

export function SortDropdown({
  value,
  onChange,
  options,
  label,
  className,
}: SortDropdownProps) {
  const t = useTranslations("table");
  const displayLabel = label ?? t("sortBy");

  return (
    <PackageSortDropdown
      value={value}
      onChange={onChange}
      options={options}
      label={displayLabel}
      className={className}
    />
  );
}

export type { SortDropdownProps, SortOption };
