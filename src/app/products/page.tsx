"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ProductGrid,
  ProductFilters,
  ProductSortBar,
  PRODUCT_SORT_VALUES,
} from "@/components";
import { UI_LABELS, API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import type { ProductDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

type ProductItem = Pick<
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
  | "category"
>;

interface ProductsResponse {
  data: ProductItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven state
  const categoryParam = searchParams.get("category") ?? "";
  const minPriceParam = searchParams.get("minPrice") ?? "";
  const maxPriceParam = searchParams.get("maxPrice") ?? "";
  const sortParam = searchParams.get("sort") ?? PRODUCT_SORT_VALUES.NEWEST;
  const pageParam = Number(searchParams.get("page") ?? "1");

  // Local controlled inputs (applied to URL on change)
  const [category, setCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);

  // Sync local state when URL changes (back/forward navigation)
  useEffect(() => {
    setCategory(categoryParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
  }, [categoryParam, minPriceParam, maxPriceParam]);

  // Build API query string from current URL params
  const apiUrl = useMemo(() => {
    const filters: string[] = ["status==published"];
    if (categoryParam) filters.push(`category==${categoryParam}`);
    if (minPriceParam) filters.push(`price>=${minPriceParam}`);
    if (maxPriceParam) filters.push(`price<=${maxPriceParam}`);

    const params = new URLSearchParams({
      page: String(pageParam),
      pageSize: String(PAGE_SIZE),
      sorts: sortParam,
      filters: filters.join(","),
    });
    return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
  }, [categoryParam, minPriceParam, maxPriceParam, sortParam, pageParam]);

  const { data, isLoading } = useApiQuery<ProductsResponse>({
    queryKey: ["products", apiUrl],
    queryFn: () => apiClient.get(apiUrl),
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  // Extract categories from current products for filter options
  // In a real app, this would come from the categories API
  const allCategoriesFromData = useMemo(() => {
    if (!products.length) return [];
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return [...cats].sort();
  }, [products]);

  // URL helpers
  const updateUrl = useCallback(
    (params: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });
      // Reset page when filters change
      if (!params.page) next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateUrl({ category: value });
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    updateUrl({ minPrice: value });
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    updateUrl({ maxPrice: value });
  };

  const handleSortChange = (value: string) => {
    updateUrl({ sort: value });
  };

  const handleClear = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    Boolean(categoryParam) || Boolean(minPriceParam) || Boolean(maxPriceParam);

  return (
    <div className={`min-h-screen ${themed.bgSecondary}`}>
      <div className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCTS_PAGE.TITLE}
          </h1>
          <p className={`text-sm mt-1 ${themed.textSecondary}`}>
            {UI_LABELS.PRODUCTS_PAGE.SUBTITLE}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div
              className={`sticky top-20 ${themed.bgPrimary} rounded-xl p-4 border ${themed.border}`}
            >
              <ProductFilters
                category={category}
                categories={allCategoriesFromData}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={handleCategoryChange}
                onMinPriceChange={handleMinPriceChange}
                onMaxPriceChange={handleMaxPriceChange}
                onClear={handleClear}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter strip */}
            <div className="lg:hidden mb-4">
              <div
                className={`${themed.bgPrimary} rounded-xl p-4 border ${themed.border}`}
              >
                <ProductFilters
                  category={category}
                  categories={allCategoriesFromData}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onCategoryChange={handleCategoryChange}
                  onMinPriceChange={handleMinPriceChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  onClear={handleClear}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            {/* Sort bar */}
            <div className="mb-4">
              <ProductSortBar
                total={meta?.total ?? 0}
                showing={products.length}
                sort={sortParam}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Grid */}
            <ProductGrid
              products={products}
              loading={isLoading}
              skeletonCount={PAGE_SIZE}
            />

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pageParam - 1)}
                  disabled={pageParam <= 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border} hover:bg-indigo-50 dark:hover:bg-indigo-950/30`}
                >
                  {UI_LABELS.ACTIONS.BACK}
                </button>

                <span className={`text-sm ${themed.textSecondary} px-2`}>
                  {pageParam} / {meta.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pageParam + 1)}
                  disabled={!meta.hasMore}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border} hover:bg-indigo-50 dark:hover:bg-indigo-950/30`}
                >
                  {UI_LABELS.ACTIONS.NEXT}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
