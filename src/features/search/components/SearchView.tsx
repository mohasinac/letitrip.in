"use client";

import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { PRODUCT_SORT_VALUES } from "@/components";
import {
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
  SearchResultsSection,
  EmptyState,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useApiQuery, useUrlTable } from "@/hooks";
import { searchService, categoryService } from "@/services";
import { debounce } from "@/utils";
import type { CategoryDocument, ProductDocument } from "@/db/schema";
import type { ProductSortValue } from "@/components";

const { themed, typography, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 400;

type ProductCardData = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
>;

interface SearchResponse {
  items: ProductCardData[];
  q: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  backend: "algolia" | "in-memory";
}

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

  const [inputValue, setInputValue] = useState(urlQ);

  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  const debouncedSetQ = useMemo(
    () => debounce((q: string) => table.set("q", q), DEBOUNCE_MS),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedSetQ(val);
  };

  const { data: catData } = useApiQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
  });

  const topCategories = useMemo(
    () => (catData ?? []).filter((c) => c.tier === 1),
    [catData],
  );

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

  const { data: searchData, isLoading } = useApiQuery<SearchResponse>({
    queryKey: ["search", table.params.toString()],
    queryFn: () => searchService.query(searchParams),
  });

  const products = useMemo(() => searchData?.items ?? [], [searchData]);
  const total = searchData?.total ?? 0;
  const totalPages = searchData?.totalPages ?? 1;

  const categoryOptions = useMemo(
    () => topCategories.map((c) => ({ value: c.id, label: c.name })),
    [topCategories],
  );

  const activeFilterCount = [urlCategory, urlMinPrice, urlMaxPrice].filter(
    Boolean,
  ).length;

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
  const handleClearFilters = () =>
    table.clear(["category", "minPrice", "maxPrice"]);

  const hasAnyFilter = !!(urlQ || urlCategory || urlMinPrice || urlMaxPrice);

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {t("title")}
        </h1>
        <p className={`mt-1 ${themed.textSecondary}`}>{t("subtitle")}</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={t("searchInputPlaceholder")}
          autoFocus
          className={`w-full h-12 pl-4 pr-12 rounded-xl border text-base ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <span
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${THEME_CONSTANTS.icon.muted} pointer-events-none`}
        >
          <SearchIcon className="w-5 h-5" />
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={activeFilterCount}
          onClearAll={handleClearFilters}
        >
          <FilterFacetSection
            title="Category"
            options={categoryOptions}
            selected={urlCategory ? [urlCategory] : []}
            onChange={(vals) => table.set("category", vals[0] ?? "")}
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
          onClearAll={handleClearFilters}
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
    </main>
  );
}
