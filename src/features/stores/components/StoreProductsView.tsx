"use client";

import { useMemo } from "react";
import { PackageSearch } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import {
  ActiveFilterChips,
  EmptyState,
  ListingLayout,
  ProductFilters,
  ProductGrid,
  PRODUCT_SORT_VALUES,
  Search,
  SortDropdown,
  Spinner,
  TablePagination,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useStoreProducts } from "../hooks";

const { flex } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

interface StoreProductsViewProps {
  storeSlug: string;
}

export function StoreProductsView({ storeSlug }: StoreProductsViewProps) {
  const t = useTranslations("storePage");
  const tProducts = useTranslations("products");
  const tActions = useTranslations("actions");

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });

  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const categoryParam = table.get("category");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const pageParam = table.getNumber("page", 1);

  const sortOptions = useMemo(
    () => [
      { value: PRODUCT_SORT_VALUES.NEWEST, label: tProducts("sortNewest") },
      { value: PRODUCT_SORT_VALUES.OLDEST, label: tProducts("sortOldest") },
      { value: PRODUCT_SORT_VALUES.PRICE_LOW, label: tProducts("sortPriceLow") },
      { value: PRODUCT_SORT_VALUES.PRICE_HIGH, label: tProducts("sortPriceHigh") },
      { value: PRODUCT_SORT_VALUES.NAME_AZ, label: tProducts("sortNameAZ") },
      { value: PRODUCT_SORT_VALUES.NAME_ZA, label: tProducts("sortNameZA") },
    ],
    [tProducts],
  );

  /* ---- Build API query params ---- */
  const apiParams = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(pageParam));
    sp.set("pageSize", String(PAGE_SIZE));
    sp.set("sorts", sortParam);

    const filterParts: string[] = [];
    if (categoryParam) filterParts.push(`category==${categoryParam}`);
    if (minPriceParam) filterParts.push(`price>=${minPriceParam}`);
    if (maxPriceParam) filterParts.push(`price<=${maxPriceParam}`);
    if (filterParts.length > 0) sp.set("filters", filterParts.join(","));

    const q = table.get("q");
    if (q) sp.set("q", q);

    return sp.toString();
  }, [pageParam, sortParam, categoryParam, minPriceParam, maxPriceParam, table]);

  const { data, isLoading, error } = useStoreProducts(storeSlug, apiParams);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const totalPages = Math.ceil(total / pageSize) || 1;

  /* ---- Derive categories from fetched data ---- */
  const allCategories = useMemo(() => {
    if (!items.length) return [];
    const cats = new Set(
      items
        .map((p) => (p as Record<string, unknown>).category as string | undefined)
        .filter(Boolean),
    );
    return [...cats].sort() as string[];
  }, [items]);

  /* ---- Active filters ---- */
  const hasActiveFilters =
    Boolean(categoryParam) || Boolean(minPriceParam) || Boolean(maxPriceParam);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (categoryParam) {
      filters.push({
        key: "category",
        label: tProducts("filterCategory"),
        value: categoryParam,
      });
    }
    if (minPriceParam) {
      filters.push({
        key: "minPrice",
        label: tProducts("filterMinPrice"),
        value: tProducts("filterPriceValue", { value: minPriceParam }),
      });
    }
    if (maxPriceParam) {
      filters.push({
        key: "maxPrice",
        label: tProducts("filterMaxPrice"),
        value: tProducts("filterPriceValue", { value: maxPriceParam }),
      });
    }
    return filters;
  }, [categoryParam, minPriceParam, maxPriceParam, tProducts]);

  const clearFilters = () => table.clear(["category", "minPrice", "maxPrice"]);

  return (
    <ListingLayout
      searchSlot={
        <Search
          value={table.get("q")}
          onChange={(v) => table.set("q", v)}
          placeholder={t("products.searchPlaceholder")}
          onClear={() => table.set("q", "")}
        />
      }
      filterContent={
        <ProductFilters
          category={categoryParam}
          categories={allCategories}
          minPrice={minPriceParam}
          maxPrice={maxPriceParam}
          onCategoryChange={(v) => table.set("category", v)}
          onMinPriceChange={(v) => table.set("minPrice", v)}
          onMaxPriceChange={(v) => table.set("maxPrice", v)}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      }
      filterActiveCount={activeFilters.length}
      onFilterApply={() => table.setPage(1)}
      onFilterClear={clearFilters}
      sortSlot={
        <SortDropdown
          value={sortParam}
          onChange={(v) => table.set("sort", v)}
          options={sortOptions}
        />
      }
      activeFiltersSlot={
        activeFilters.length > 0 ? (
          <ActiveFilterChips
            filters={activeFilters}
            onRemove={(key) => table.set(key, "")}
            onClearAll={clearFilters}
          />
        ) : undefined
      }
      paginationSlot={
        totalPages > 1 ? (
          <TablePagination
            total={total}
            currentPage={pageParam}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={table.setPage}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
            pageSizeOptions={[12, 24, 48]}
          />
        ) : undefined
      }
    >
      {isLoading && (
        <div className={`${flex.hCenter} ${THEME_CONSTANTS.page.empty}`}>
          <Spinner />
        </div>
      )}
      {!!error && !isLoading && (
        <EmptyState
          title={t("error.title")}
          description={t("error.description")}
        />
      )}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={<PackageSearch className="w-16 h-16" />}
          title={t("products.empty.title")}
          description={t("products.empty.description")}
          actionLabel={hasActiveFilters ? tActions("clearAll") : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      )}
      {!isLoading && !error && items.length > 0 && (
        <ProductGrid
          products={items}
          loading={false}
          skeletonCount={PAGE_SIZE}
        />
      )}
    </ListingLayout>
  );
}
