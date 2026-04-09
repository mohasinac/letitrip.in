"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { Label, Text } from "@mohasinac/appkit/ui";
import SelectField from "../forms/Select";

const { themed, flex } = THEME_CONSTANTS;

export const PRODUCT_SORT_VALUES = {
  NEWEST: "-createdAt",
  OLDEST: "createdAt",
  PRICE_LOW: "price",
  PRICE_HIGH: "-price",
  RATING_HIGH: "-avgRating",
  POPULAR: "-viewCount",
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
    { value: PRODUCT_SORT_VALUES.RATING_HIGH, label: t("sortRating") },
    { value: PRODUCT_SORT_VALUES.POPULAR, label: t("sortPopular") },
    { value: PRODUCT_SORT_VALUES.NAME_AZ, label: t("sortNameAZ") },
    { value: PRODUCT_SORT_VALUES.NAME_ZA, label: t("sortNameZA") },
  ];

  return (
    <div className={`${flex.between} gap-4`}>
      <Text className={`text-sm ${themed.textSecondary}`}>
        {t("showing", { showing, total })}
      </Text>
      <div className="flex items-center gap-2">
        <Label
          className={`text-sm font-medium ${themed.textSecondary} shrink-0`}
        >
          {t("sortBy")}
        </Label>
        <SelectField
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          options={sortOptions}
          className={`text-sm ${themed.bgPrimary} ${themed.textPrimary} min-w-40`}
        />
      </div>
    </div>
  );
}
