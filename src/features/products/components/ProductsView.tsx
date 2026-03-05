"use client";

import { useCallback, useMemo, useState } from "react";
import { PackageSearch, Gavel } from "lucide-react";
import {
  ProductGrid,
  ProductFilters,
  Search,
  SortDropdown,
  ActiveFilterChips,
  TablePagination,
  ListingLayout,
  PRODUCT_SORT_VALUES,
  EmptyState,
  Button,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { Heading, Text, TextLink } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { useProducts } from "../hooks";
import { wishlistService } from "@/services";

const PAGE_SIZE = 24;

export function ProductsView() {
  const t = useTranslations("products");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });
  const categoryParam = table.get("category");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const searchQuery = table.get("q");
  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const pageParam = table.getNumber("page", 1);

  const sortOptions = [
    { value: PRODUCT_SORT_VALUES.NEWEST, label: t("sortNewest") },
    { value: PRODUCT_SORT_VALUES.OLDEST, label: t("sortOldest") },
    { value: PRODUCT_SORT_VALUES.PRICE_LOW, label: t("sortPriceLow") },
    { value: PRODUCT_SORT_VALUES.PRICE_HIGH, label: t("sortPriceHigh") },
    { value: PRODUCT_SORT_VALUES.NAME_AZ, label: t("sortNameAZ") },
    { value: PRODUCT_SORT_VALUES.NAME_ZA, label: t("sortNameZA") },
  ];

  const filtersStr = useMemo(() => {
    const parts = ["status==published"];
    if (categoryParam) parts.push(`category==${categoryParam}`);
    if (minPriceParam) parts.push(`price>=${minPriceParam}`);
    if (maxPriceParam) parts.push(`price<=${maxPriceParam}`);
    return parts.join(",");
  }, [categoryParam, minPriceParam, maxPriceParam]);

  const apiParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pageParam),
      pageSize: String(PAGE_SIZE),
      sorts: sortParam,
      filters: filtersStr,
    });
    if (searchQuery) params.set("q", searchQuery);
    return params.toString();
  }, [filtersStr, sortParam, pageParam, searchQuery]);

  const {
    products,
    total: totalItems,
    totalPages,
    isLoading,
  } = useProducts(apiParams);

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
        ? [{ key: "category", label: t("filterCategory"), value: categoryParam }]
        : []),
      ...(minPriceParam
        ? [{ key: "minPrice", label: t("filterMinPrice"), value: t("filterPriceValue", { value: minPriceParam }) }]
        : []),
      ...(maxPriceParam
        ? [{ key: "maxPrice", label: t("filterMaxPrice"), value: t("filterPriceValue", { value: maxPriceParam }) }]
        : []),
    ],
    [categoryParam, minPriceParam, maxPriceParam, t],
  );

  const clearFilters = () => table.clear(["category", "minPrice", "maxPrice"]);

  // ── Bulk wishlist handler ─────────────────────────────────────────
  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => wishlistService.add(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(tActions("bulkPartialSuccess", { success: succeeded, total: selectedIds.length }));
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <div className={`${THEME_CONSTANTS.page.container.full} py-8`}>
        <ListingLayout
          headerSlot={
            <div>
              <Heading level={1}>{t("title")}</Heading>
              <Text variant="secondary" size="sm" className="mt-1">
                {t("subtitle")}
              </Text>
              {/* Auctions cross-link */}
              <TextLink
                href={ROUTES.PUBLIC.AUCTIONS}
                variant="inherit"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <Gavel className="w-4 h-4 flex-shrink-0" />
                {t("auctionsBannerCta")}
              </TextLink>
            </div>
          }
          searchSlot={
            <Search
              value={table.get("q")}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          filterContent={
            <ProductFilters
              category={categoryParam}
              categories={allCategoriesFromData}
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
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={
            user ? (
              <Button variant="primary" size="sm" onClick={handleBulkAddToWishlist}>
                {tActions("bulkAddToWishlist", { count: selectedIds.length })}
              </Button>
            ) : undefined
          }
          paginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={totalItems}
                currentPage={pageParam}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={table.setPage}
                onPageSizeChange={(n) => table.set("pageSize", String(n))}
                pageSizeOptions={[12, 24, 48]}
              />
            ) : undefined
          }
        >
          {!isLoading && products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="w-16 h-16" />}
              title={t("noProductsFound")}
              description={t("noProductsSubtitle")}
              actionLabel={hasActiveFilters ? tActions("clearAll") : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          ) : (
            <ProductGrid
              products={products}
              loading={isLoading}
              skeletonCount={PAGE_SIZE}
              selectable={!!user}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          )}
        </ListingLayout>
      </div>
    </div>
  );
}
