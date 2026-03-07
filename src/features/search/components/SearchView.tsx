"use client";

import { useMemo } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PRODUCT_SORT_VALUES, Search, Span } from "@/components";
import {
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
  EmptyState,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { Heading, Text, Main } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, usePendingTable } from "@/hooks";
import { useSearch } from "@/features/search";
import type { ProductSortValue } from "@/components";
import { SearchResultsSection } from "./SearchResultsSection";

const { themed, spacing, page } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

export function SearchView() {
  const t = useTranslations("search");
  const table = useUrlTable({
    defaults: { sort: PRODUCT_SORT_VALUES.NEWEST, pageSize: String(PAGE_SIZE) },
  });

  const urlQ = table.get("q");
  const urlCategory = table.get("category");
  const urlMinPrice = table.get("minPrice");
  const urlMaxPrice = table.get("maxPrice");
  const urlSort =
    (table.get("sort") as ProductSortValue) || PRODUCT_SORT_VALUES.NEWEST;
  const urlPage = table.getNumber("page", 1);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    if (urlCategory) params.set("category", urlCategory);
    if (urlMinPrice) params.set("minPrice", urlMinPrice);
    if (urlMaxPrice) params.set("maxPrice", urlMaxPrice);
    params.set("sort", urlSort);
    params.set("page", String(urlPage));
    params.set("pageSize", String(PAGE_SIZE));
    return params.toString();
  }, [urlQ, urlCategory, urlMinPrice, urlMaxPrice, urlSort, urlPage]);

  const { catData, products, total, totalPages, isLoading } =
    useSearch(searchParams);

  const topCategories = useMemo(
    () => catData.filter((c) => c.tier === 1),
    [catData],
  );

  const categoryOptions = useMemo(
    () => topCategories.map((c) => ({ value: c.id, label: c.name })),
    [topCategories],
  );

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["category", "minPrice", "maxPrice"]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const result: ActiveFilter[] = [];
    if (urlCategory) {
      result.push({
        key: "category",
        label: "Category",
        value:
          topCategories.find((c) => c.id === urlCategory)?.name ?? urlCategory,
      });
    }
    if (urlMinPrice || urlMaxPrice) {
      result.push({
        key: "price",
        label: "Price",
        value:
          urlMinPrice && urlMaxPrice
            ? `₹${urlMinPrice}–₹${urlMaxPrice}`
            : urlMinPrice
              ? `from ₹${urlMinPrice}`
              : `up to ₹${urlMaxPrice}`,
      });
    }
    return result;
  }, [urlCategory, urlMinPrice, urlMaxPrice, topCategories]);

  const handleSortChange = (sort: string) => table.set("sort", sort);

  const hasAnyFilter = !!(urlQ || urlCategory || urlMinPrice || urlMaxPrice);

  return (
    <Main className={`${page.container["2xl"]} py-10 ${spacing.stack}`}>
      <div>
        <Heading level={1}>{t("title")}</Heading>
        <Text variant="secondary" className="mt-1">
          {t("subtitle")}
        </Text>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("searchInputPlaceholder")}
          className="w-full h-12"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={filterActiveCount}
          onApply={onFilterApply}
          onReset={onFilterClear}
        >
          <FilterFacetSection
            title="Category"
            options={categoryOptions}
            selected={
              pendingTable.get("category") ? [pendingTable.get("category")] : []
            }
            onChange={(vals) => pendingTable.set("category", vals[0] ?? "")}
            searchable={categoryOptions.length > 6}
          />
        </FilterDrawer>
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={(key) => {
            if (key === "price") {
              table.setMany({ minPrice: "", maxPrice: "" });
            } else {
              table.set(key, "");
            }
          }}
          onClearAll={onFilterClear}
        />
      </div>

      {hasAnyFilter ? (
        <SearchResultsSection
          products={products}
          total={total}
          totalPages={totalPages}
          urlQ={urlQ}
          urlSort={urlSort}
          urlPage={urlPage}
          isLoading={isLoading}
          onSortChange={handleSortChange}
          onPageChange={table.setPage}
        />
      ) : (
        <EmptyState
          icon={<SearchIcon className="w-16 h-16" />}
          title={t("emptyQuery")}
          description={t("subtitle")}
        />
      )}
    </Main>
  );
}
