"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import type { CategoryDocument } from "@/db/schema";
import { Button, Input, Label, Select, Span } from "@/components";

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

  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* Category filter */}
      <div className="flex flex-col gap-1">
        <Label className={`text-sm font-medium ${themed.textSecondary}`}>
          {t("categoryFilter")}
        </Label>
        <Select
          value={urlCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={[
            { value: "", label: t("allCategories") },
            ...topCategories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-1">
        <Label className={`text-sm font-medium ${themed.textSecondary}`}>
          {t("priceRange")}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={t("minPrice")}
            className="w-28"
          />
          <Span className={`text-sm ${themed.textSecondary}`}>–</Span>
          <Input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={t("maxPrice")}
            className="w-28"
          />
          <Button
            onClick={() => onPriceFilter(minPrice, maxPrice)}
            variant="primary"
            className="h-10"
          >
            {tActions("search")}
          </Button>
        </div>
      </div>

      {/* Clear filters */}
      {showClear && (
        <Button variant="outline" onClick={onClearFilters} className="h-10">
          {t("clearFilters")}
        </Button>
      )}
    </div>
  );
}
