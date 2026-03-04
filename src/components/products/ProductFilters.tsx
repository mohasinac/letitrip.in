"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import {
  Aside,
  Button,
  Heading,
  Input,
  Label,
  Select,
  Span,
} from "@/components";

const { themed, flex } = THEME_CONSTANTS;

interface ProductFiltersProps {
  category: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ProductFilters({
  category,
  categories,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
  hasActiveFilters,
}: ProductFiltersProps) {
  const t = useTranslations("products");
  return (
    <Aside className="space-y-5">
      {/* Header */}
      <div className={flex.between}>
        <Heading level={2} className="font-semibold text-base">
          {t("filters")}
        </Heading>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {t("clearFilters")}
          </Button>
        )}
      </div>

      {/* Category */}
      <div>
        <Label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {t("filterCategory")}
        </Label>
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: "", label: t("filterAllCategories") },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
          className={`w-full text-sm ${themed.bgPrimary} ${themed.textPrimary}`}
        />
      </div>

      {/* Price Range */}
      <div>
        <Label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {t("filterPriceRange")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder={t("filterMinPrice")}
            className={`w-full text-sm ${themed.bgPrimary} ${themed.textPrimary}`}
          />
          <Span className={`text-xs ${themed.textSecondary} shrink-0`}>to</Span>
          <Input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder={t("filterMaxPrice")}
            className={`w-full text-sm ${themed.bgPrimary} ${themed.textPrimary}`}
          />
        </div>
      </div>
    </Aside>
  );
}
