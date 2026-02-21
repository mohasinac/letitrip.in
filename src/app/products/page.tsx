"use client";

import { useMemo } from "react";
import {
  ProductGrid,
  ProductFilters,
  ProductSortBar,
  FilterDrawer,
  ActiveFilterChips,
  Pagination,
  PRODUCT_SORT_VALUES,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { UI_LABELS, API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { useApiQuery, useUrlTable } from "@/hooks";
import type { ProductDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

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
  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });
  const categoryParam = table.get("category");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const pageParam = table.getNumber("page", 1);

  const filtersStr = useMemo(() => {
    const parts = ["status==published"];
    if (categoryParam) parts.push(`category==${categoryParam}`);
    if (minPriceParam) parts.push(`price>=${minPriceParam}`);
    if (maxPriceParam) parts.push(`price<=${maxPriceParam}`);
    return parts.join(",");
  }, [categoryParam, minPriceParam, maxPriceParam]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pageParam),
      pageSize: String(PAGE_SIZE),
      sorts: sortParam,
      filters: filtersStr,
    });
    return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
  }, [filtersStr, sortParam, pageParam]);

  // Use fetch() to preserve meta field (apiClient strips the outer wrapper)
  const { data, isLoading } = useApiQuery<ProductsResponse>({
    queryKey: ["products", table.params.toString()],
    queryFn: () =>
      fetch(apiUrl)
        .then((r) => r.json())
        .then((r) => r as ProductsResponse),
  });

  const products = data?.data ?? [];
  const meta = data?.meta;

  const allCategoriesFromData = useMemo(() => {
    if (!products.length) return [];
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return [...cats].sort();
  }, [products]);

  const hasActiveFilters =
    Boolean(categoryParam) || Boolean(minPriceParam) || Boolean(maxPriceParam);

  const activeFilters = useMemo<ActiveFilter[]>(
    () => [
      ...(categoryParam
        ? [{ key: "category", label: "Category", value: categoryParam }]
        : []),
      ...(minPriceParam
        ? [
            {
              key: "minPrice",
              label: "Min Price",
              value: `Rs.${minPriceParam}`,
            },
          ]
        : []),
      ...(maxPriceParam
        ? [
            {
              key: "maxPrice",
              label: "Max Price",
              value: `Rs.${maxPriceParam}`,
            },
          ]
        : []),
    ],
    [categoryParam, minPriceParam, maxPriceParam],
  );

  const filterContent = (
    <ProductFilters
      category={categoryParam}
      categories={allCategoriesFromData}
      minPrice={minPriceParam}
      maxPrice={maxPriceParam}
      onCategoryChange={(v) => table.set("category", v)}
      onMinPriceChange={(v) => table.set("minPrice", v)}
      onMaxPriceChange={(v) => table.set("maxPrice", v)}
      onClear={() => table.clear(["category", "minPrice", "maxPrice"])}
      hasActiveFilters={hasActiveFilters}
    />
  );

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
              {filterContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter drawer */}
            <div className="lg:hidden mb-4">
              <FilterDrawer
                activeCount={activeFilters.length}
                onClearAll={() =>
                  table.clear(["category", "minPrice", "maxPrice"])
                }
              >
                {filterContent}
              </FilterDrawer>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="mb-4">
                <ActiveFilterChips
                  filters={activeFilters}
                  onRemove={(key) => table.set(key, "")}
                  onClearAll={() =>
                    table.clear(["category", "minPrice", "maxPrice"])
                  }
                />
              </div>
            )}

            {/* Sort bar */}
            <div className="mb-4">
              <ProductSortBar
                total={meta?.total ?? 0}
                showing={products.length}
                sort={sortParam}
                onSortChange={(v) => table.set("sort", v)}
              />
            </div>

            {/* Grid */}
            <ProductGrid
              products={products}
              loading={isLoading}
              skeletonCount={PAGE_SIZE}
            />

            {/* Pagination */}
            {(meta?.totalPages ?? 1) > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={pageParam}
                  totalPages={meta?.totalPages ?? 1}
                  onPageChange={table.setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
