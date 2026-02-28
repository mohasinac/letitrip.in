"use client";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

const { themed, borderRadius, input } = THEME_CONSTANTS;

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
    <aside className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-base ${themed.textPrimary}`}>
          {t("filters")}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {t("filterCategory")}
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`w-full text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary}`}
        >
          <option value="">{t("filterAllCategories")}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label
          className={`block text-xs font-medium mb-1.5 ${themed.textSecondary}`}
        >
          {t("filterPriceRange")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder={t("filterMinPrice")}
            className={`w-full text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary}`}
          />
          <span className={`text-xs ${themed.textSecondary} shrink-0`}>to</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder={t("filterMaxPrice")}
            className={`w-full text-sm ${input.base} ${themed.bgPrimary} ${themed.textPrimary}`}
          />
        </div>
      </div>
    </aside>
  );
}
