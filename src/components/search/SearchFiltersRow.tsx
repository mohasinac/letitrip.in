"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import type { CategoryDocument } from "@/db/schema";
import { Label, Span } from "../typography/Typography";

const { themed } = THEME_CONSTANTS;

interface SearchFiltersRowProps {
  urlCategory: string;
  topCategories: CategoryDocument[];
  urlMinPrice: string;
  urlMaxPrice: string;
  showClear: boolean;
  onCategoryChange: (value: string) => void;
  onPriceFilter: (min: string, max: string) => void;
  onClearFilters: () => void;
}

export function SearchFiltersRow({
  urlCategory,
  topCategories,
  urlMinPrice,
  urlMaxPrice,
  showClear,
  onCategoryChange,
  onPriceFilter,
  onClearFilters,
}: SearchFiltersRowProps) {
  const t = useTranslations("search");
  const tActions = useTranslations("actions");
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);

  const inputBase = THEME_CONSTANTS.input.base;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Category filter */}
      <div className="flex flex-col gap-1">
        <Label className={`text-sm font-medium ${themed.textSecondary}`}>
          {t("categoryFilter")}
        </Label>
        <select
          value={urlCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={inputBase}
        >
          <option value="">{t("allCategories")}</option>
          {topCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-1">
        <Label className={`text-sm font-medium ${themed.textSecondary}`}>
          {t("priceRange")}
        </Label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={t("minPrice")}
            className={`w-28 ${inputBase}`}
          />
          <Span className={`text-sm ${themed.textSecondary}`}>–</Span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t("maxPrice")}
            className={`w-28 ${inputBase}`}
          />
          <button
            onClick={() => onPriceFilter(minPrice, maxPrice)}
            className="h-10 px-4 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {tActions("search")}
          </button>
        </div>
      </div>

      {/* Clear filters */}
      {showClear && (
        <button
          onClick={onClearFilters}
          className={`h-10 px-4 rounded-lg text-sm border ${themed.border} ${themed.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        >
          {t("clearFilters")}
        </button>
      )}
    </div>
  );
}
