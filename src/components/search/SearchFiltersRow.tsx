"use client";

import { useState } from "react";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { CategoryDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SEARCH_PAGE;

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
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);

  const inputBase = `h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Category filter */}
      <div className="flex flex-col gap-1">
        <label className={`text-sm font-medium ${themed.textSecondary}`}>
          {LABELS.CATEGORY_FILTER}
        </label>
        <select
          value={urlCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={inputBase}
        >
          <option value="">{LABELS.ALL_CATEGORIES}</option>
          {topCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-1">
        <label className={`text-sm font-medium ${themed.textSecondary}`}>
          {LABELS.PRICE_RANGE}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={LABELS.MIN_PRICE}
            className={`w-28 ${inputBase}`}
          />
          <span className={`text-sm ${themed.textSecondary}`}>–</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={LABELS.MAX_PRICE}
            className={`w-28 ${inputBase}`}
          />
          <button
            onClick={() => onPriceFilter(minPrice, maxPrice)}
            className="h-10 px-4 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {UI_LABELS.ACTIONS.SEARCH}
          </button>
        </div>
      </div>

      {/* Clear filters */}
      {showClear && (
        <button
          onClick={onClearFilters}
          className={`h-10 px-4 rounded-lg text-sm border ${themed.border} ${themed.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        >
          {LABELS.CLEAR_FILTERS}
        </button>
      )}
    </div>
  );
}
