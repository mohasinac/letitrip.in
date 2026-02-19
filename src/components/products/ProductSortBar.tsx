"use client";

import { UI_LABELS, THEME_CONSTANTS } from "@/constants";

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

const SORT_OPTIONS = [
  {
    value: PRODUCT_SORT_VALUES.NEWEST,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.NEWEST,
  },
  {
    value: PRODUCT_SORT_VALUES.OLDEST,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.OLDEST,
  },
  {
    value: PRODUCT_SORT_VALUES.PRICE_LOW,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.PRICE_LOW,
  },
  {
    value: PRODUCT_SORT_VALUES.PRICE_HIGH,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.PRICE_HIGH,
  },
  {
    value: PRODUCT_SORT_VALUES.NAME_AZ,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.NAME_AZ,
  },
  {
    value: PRODUCT_SORT_VALUES.NAME_ZA,
    label: UI_LABELS.PRODUCTS_PAGE.SORT_OPTIONS.NAME_ZA,
  },
];

export function ProductSortBar({
  total,
  showing,
  sort,
  onSortChange,
}: ProductSortBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={`text-sm ${themed.textSecondary}`}>
        {UI_LABELS.PRODUCTS_PAGE.SHOWING(showing, total)}
      </p>
      <div className="flex items-center gap-2">
        <label
          className={`text-sm font-medium ${themed.textSecondary} shrink-0`}
        >
          {UI_LABELS.PRODUCTS_PAGE.SORT_BY}
        </label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className={`text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary} min-w-40`}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
