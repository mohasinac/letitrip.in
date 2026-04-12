"use client";

import {
  SearchFiltersRow as AppkitSearchFiltersRow,
} from "@mohasinac/appkit/features/search";
import { useTranslations } from "next-intl";
import type { CategoryDocument } from "@/db/schema";

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

  return (
    <AppkitSearchFiltersRow
      urlCategory={urlCategory}
      categories={topCategories.map((category) => ({
        id: category.id,
        name: category.name,
      }))}
      urlMinPrice={urlMinPrice}
      urlMaxPrice={urlMaxPrice}
      showClear={showClear}
      onCategoryChange={onCategoryChange}
      onPriceFilter={onPriceFilter}
      onClearFilters={onClearFilters}
      labels={{
        categoryFilter: t("categoryFilter"),
        allCategories: t("allCategories"),
        priceRange: t("priceRange"),
        minPrice: t("minPrice"),
        maxPrice: t("maxPrice"),
        apply: tActions("search"),
        clearFilters: t("clearFilters"),
      }}
    />
  );
}
