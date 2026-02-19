/**
 * Search Page
 *
 * Route: /search
 * URL-driven search with query, category, price range, sort, and pagination params.
 * Uses in-memory full-text search via /api/search.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid, ProductSortBar, PRODUCT_SORT_VALUES } from "@/components";
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

  // Local input state (debounces to URL)
  const [inputValue, setInputValue] = useState(urlQ);

  // Sync inputValue if URL q changes externally (e.g. browser back/forward)
  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  /* ---- URL update helpers ---- */
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

  // Debounced router push for text input
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

  /* ---- Fetch top-level categories for filter dropdown ---- */
  const { data: catData } = useApiQuery<CategoriesResponse>({
    queryKey: ["categories", "flat"],
    queryFn: () =>
      fetch(`${API_ENDPOINTS.CATEGORIES.LIST}?flat=true`).then((r) => r.json()),
  });

  const topCategories = useMemo(
    () => (catData?.data ?? []).filter((c) => c.tier === 1),
    [catData],
  );

  /* ---- Build search API URL ---- */
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

  /* ---- Fetch search results ---- */
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

  /* ---- Handlers ---- */
  const handleSortChange = (sort: string) => {
    router.replace(buildUrl({ sort, page: "1" }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(buildUrl({ category: e.target.value, page: "1" }));
  };

  const handlePriceFilter = () => {
    const minEl = document.getElementById(
      "min-price",
    ) as HTMLInputElement | null;
    const maxEl = document.getElementById(
      "max-price",
    ) as HTMLInputElement | null;
    router.replace(
      buildUrl({
        minPrice: minEl?.value ?? "",
        maxPrice: maxEl?.value ?? "",
        page: "1",
      }),
    );
  };

  const handleClearFilters = () => {
    router.replace(`${ROUTES.PUBLIC.SEARCH}?q=${encodeURIComponent(urlQ)}`);
  };

  /* ---- Render ---- */
  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Page heading */}
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
          🔍
        </span>
      </div>

      {/* Filters Row */}
      <div className={`flex flex-wrap gap-4 items-end`}>
        {/* Category filter */}
        <div className="flex flex-col gap-1">
          <label className={`text-sm font-medium ${themed.textSecondary}`}>
            {UI_LABELS.SEARCH_PAGE.CATEGORY_FILTER}
          </label>
          <select
            value={urlCategory}
            onChange={handleCategoryChange}
            className={`h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">{UI_LABELS.SEARCH_PAGE.ALL_CATEGORIES}</option>
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
            {UI_LABELS.SEARCH_PAGE.PRICE_RANGE}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="min-price"
              type="number"
              min={0}
              defaultValue={urlMinPrice}
              placeholder={UI_LABELS.SEARCH_PAGE.MIN_PRICE}
              className={`w-28 h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <span className={`text-sm ${themed.textSecondary}`}>–</span>
            <input
              id="max-price"
              type="number"
              min={0}
              defaultValue={urlMaxPrice}
              placeholder={UI_LABELS.SEARCH_PAGE.MAX_PRICE}
              className={`w-28 h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <button
              onClick={handlePriceFilter}
              className="h-10 px-4 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              {UI_LABELS.ACTIONS.SEARCH}
            </button>
          </div>
        </div>

        {/* Clear filters (only when filters active) */}
        {(urlCategory || urlMinPrice || urlMaxPrice) && (
          <button
            onClick={handleClearFilters}
            className={`h-10 px-4 rounded-lg text-sm border ${themed.border} ${themed.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            {UI_LABELS.SEARCH_PAGE.CLEAR_FILTERS}
          </button>
        )}
      </div>

      {/* Results header */}
      {urlQ || urlCategory || urlMinPrice || urlMaxPrice ? (
        <>
          {/* Sort bar */}
          <ProductSortBar
            total={total}
            showing={products.length}
            sort={urlSort}
            onSortChange={handleSortChange}
          />

          {/* Product Grid */}
          {isLoading ? (
            <ProductGrid products={[]} loading skeletonCount={PAGE_SIZE} />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className={`text-lg font-medium ${themed.textPrimary}`}>
                {UI_LABELS.SEARCH_PAGE.NO_RESULTS}
              </p>
              {urlQ && (
                <p className={`mt-2 text-sm ${themed.textSecondary}`}>
                  {UI_LABELS.SEARCH_PAGE.NO_RESULTS_SUBTITLE(urlQ)}
                </p>
              )}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() =>
                  router.replace(buildUrl({ page: String(urlPage - 1) }))
                }
                disabled={urlPage === 1}
                className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
              >
                {UI_LABELS.ACTIONS.BACK}
              </button>
              <span className={`px-4 py-2 text-sm ${themed.textSecondary}`}>
                {urlPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  router.replace(buildUrl({ page: String(urlPage + 1) }))
                }
                disabled={urlPage >= totalPages}
                className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
              >
                {UI_LABELS.ACTIONS.NEXT}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state — no query yet */
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className={`text-xl ${themed.textSecondary}`}>
            {UI_LABELS.SEARCH_PAGE.EMPTY_QUERY}
          </p>
        </div>
      )}
    </main>
  );
}
