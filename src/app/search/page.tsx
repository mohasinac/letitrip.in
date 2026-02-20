/**
 * Search Page
 *
 * Route: /search
 * URL-driven search with query, category, price range, sort, and pagination params.
 * Uses in-memory full-text search via /api/search.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT_SORT_VALUES } from "@/components";
import { SearchFiltersRow, SearchResultsSection } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useApiQuery } from "@/hooks";
import { debounce } from "@/utils";
import type { ProductDocument, CategoryDocument } from "@/db/schema";
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
  data: ProductCardData[];
  meta: {
    q: string;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface CategoriesResponse {
  data: CategoryDocument[];
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlMinPrice = searchParams.get("minPrice") ?? "";
  const urlMaxPrice = searchParams.get("maxPrice") ?? "";
  const urlSort =
    (searchParams.get("sort") as ProductSortValue) ||
    PRODUCT_SORT_VALUES.NEWEST;
  const urlPage = Number(searchParams.get("page") ?? "1");

  const [inputValue, setInputValue] = useState(urlQ);

  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  const buildUrl = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = {
        q: urlQ,
        category: urlCategory,
        minPrice: urlMinPrice,
        maxPrice: urlMaxPrice,
        sort: urlSort,
        page: String(urlPage),
        ...overrides,
      };
      Object.entries(merged).forEach(([key, val]) => {
        if ((val && val !== "1") || key === "q" || key === "sort") {
          if (val) params.set(key, val);
        }
      });
      return `${ROUTES.PUBLIC.SEARCH}?${params.toString()}`;
    },
    [urlQ, urlCategory, urlMinPrice, urlMaxPrice, urlSort, urlPage],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedPush = useCallback(
    debounce((q: string) => {
      router.replace(buildUrl({ q, page: "1" }));
    }, DEBOUNCE_MS),
    [buildUrl, router],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    debouncedPush(val);
  };

  const { data: catData } = useApiQuery<CategoriesResponse>({
    queryKey: ["categories", "flat"],
    queryFn: () =>
      fetch(`${API_ENDPOINTS.CATEGORIES.LIST}?flat=true`).then((r) => r.json()),
  });

  const topCategories = useMemo(
    () => (catData?.data ?? []).filter((c) => c.tier === 1),
    [catData],
  );

  const searchUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    if (urlCategory) params.set("category", urlCategory);
    if (urlMinPrice) params.set("minPrice", urlMinPrice);
    if (urlMaxPrice) params.set("maxPrice", urlMaxPrice);
    params.set("sort", urlSort);
    params.set("page", String(urlPage));
    params.set("pageSize", String(PAGE_SIZE));
    return `${API_ENDPOINTS.SEARCH.QUERY}?${params.toString()}`;
  }, [urlQ, urlCategory, urlMinPrice, urlMaxPrice, urlSort, urlPage]);

  const { data: searchData, isLoading } = useApiQuery<SearchResponse>({
    queryKey: [
      "search",
      urlQ,
      urlCategory,
      urlMinPrice,
      urlMaxPrice,
      urlSort,
      String(urlPage),
    ],
    queryFn: () => fetch(searchUrl).then((r) => r.json()),
  });

  const products = useMemo(() => searchData?.data ?? [], [searchData]);
  const total = searchData?.meta?.total ?? 0;
  const totalPages = searchData?.meta?.totalPages ?? 1;

  const handleSortChange = (sort: string) =>
    router.replace(buildUrl({ sort, page: "1" }));
  const handleCategoryChange = (cat: string) =>
    router.replace(buildUrl({ category: cat, page: "1" }));
  const handlePriceFilter = (min: string, max: string) =>
    router.replace(buildUrl({ minPrice: min, maxPrice: max, page: "1" }));
  const handleClearFilters = () =>
    router.replace(`${ROUTES.PUBLIC.SEARCH}?q=${encodeURIComponent(urlQ)}`);

  const hasActiveFilters = !!(urlCategory || urlMinPrice || urlMaxPrice);
  const hasAnyFilter = !!(urlQ || urlCategory || urlMinPrice || urlMaxPrice);

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      <div>
        <h1 className={`${typography.h2} ${themed.textPrimary}`}>
          {UI_LABELS.SEARCH_PAGE.TITLE}
        </h1>
        <p className={`mt-1 ${themed.textSecondary}`}>
          {UI_LABELS.SEARCH_PAGE.SUBTITLE}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={UI_LABELS.SEARCH_PAGE.PLACEHOLDER}
          autoFocus
          className={`w-full h-12 pl-4 pr-12 rounded-xl border text-base ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          ðŸ”
        </span>
      </div>

      <SearchFiltersRow
        urlCategory={urlCategory}
        topCategories={topCategories}
        urlMinPrice={urlMinPrice}
        urlMaxPrice={urlMaxPrice}
        showClear={hasActiveFilters}
        onCategoryChange={handleCategoryChange}
        onPriceFilter={handlePriceFilter}
        onClearFilters={handleClearFilters}
      />

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
          onPrevPage={() =>
            router.replace(buildUrl({ page: String(urlPage - 1) }))
          }
          onNextPage={() =>
            router.replace(buildUrl({ page: String(urlPage + 1) }))
          }
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className={`text-xl ${themed.textSecondary}`}>
            {UI_LABELS.SEARCH_PAGE.EMPTY_QUERY}
          </p>
        </div>
      )}
    </main>
  );
}
