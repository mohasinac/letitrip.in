"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

const { themed, input } = THEME_CONSTANTS;

export const PRODUCT_SORT_VALUES = {
  NEWEST: "-createdAt",
  OLDEST: "createdAt",
  PRICE_LOW: "price",
  PRICE_HIGH: "-price",
  NAME_AZ: "title",
  NAME_ZA: "-title",
} as const;

export type ProductSortValue =
  (typeof PRODUCT_SORT_VALUES)[keyof typeof PRODUCT_SORT_VALUES];

interface ProductSortBarProps {
  total: number;
  showing: number;
  sort: string;
  onSortChange: (value: string) => void;
}

export function ProductSortBar({
  total,
  showing,
  sort,
  onSortChange,
}: ProductSortBarProps) {
  const t = useTranslations("products");

  const sortOptions = [
    { value: PRODUCT_SORT_VALUES.NEWEST, label: t("sortNewest") },
    { value: PRODUCT_SORT_VALUES.OLDEST, label: t("sortOldest") },
    { value: PRODUCT_SORT_VALUES.PRICE_LOW, label: t("sortPriceLow") },
    { value: PRODUCT_SORT_VALUES.PRICE_HIGH, label: t("sortPriceHigh") },
    { value: PRODUCT_SORT_VALUES.NAME_AZ, label: t("sortNameAZ") },
    { value: PRODUCT_SORT_VALUES.NAME_ZA, label: t("sortNameZA") },
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <p className={`text-sm ${themed.textSecondary}`}>
        {t("showing", { showing, total })}
      </p>
      <div className="flex items-center gap-2">
        <label
          className={`text-sm font-medium ${themed.textSecondary} shrink-0`}
        >
          {t("sortBy")}
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={`text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary} min-w-40`}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
