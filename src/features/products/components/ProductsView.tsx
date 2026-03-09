"use client";

import { useCallback, useMemo, useState } from "react";
import { PackageSearch, Gavel } from "lucide-react";
import {
  DataTable,
  ProductCard,
  Search,
  SortDropdown,
  ActiveFilterChips,
  TablePagination,
  ListingLayout,
  PRODUCT_SORT_VALUES,
  EmptyState,
  Button,
} from "@/components";
import { ProductFilters } from "@/components";
import type { ActiveFilter } from "@/components";
import { Heading, Text, TextLink } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import {
  useUrlTable,
  useAuth,
  useMessage,
  useCategories,
  usePendingTable,
  useBrands,
} from "@/hooks";
import { useProducts } from "../hooks";
import { addToWishlistAction } from "@/actions";

import type { ProductsListResult } from "../hooks";

const PAGE_SIZE = 24;

interface ProductsViewProps {
  initialData?: ProductsListResult;
}

export function ProductsView({ initialData }: ProductsViewProps = {}) {
  const t = useTranslations("products");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: PRODUCT_SORT_VALUES.NEWEST },
  });
  // categoryParam may be comma-separated for multi-select, e.g. "cat1,cat2"
  const categoryParam = table.get("category");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const brandParam = table.get("brand");
  const searchQuery = table.get("q");
  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const pageParam = table.getNumber("page", 1);

  // ── Staged filter state via usePendingTable ───────────────────────────
  const {
    pendingTable,
    filterActiveCount: pendingFilterCount,
    onFilterApply,
    onFilterClear,
  } = usePendingTable(table, ["category", "minPrice", "maxPrice", "brand"]);

  const sortOptions = useMemo(
    () => [
      { value: PRODUCT_SORT_VALUES.NEWEST, label: t("sortNewest") },
      { value: PRODUCT_SORT_VALUES.OLDEST, label: t("sortOldest") },
      { value: PRODUCT_SORT_VALUES.PRICE_LOW, label: t("sortPriceLow") },
      { value: PRODUCT_SORT_VALUES.PRICE_HIGH, label: t("sortPriceHigh") },
      { value: PRODUCT_SORT_VALUES.NAME_AZ, label: t("sortNameAZ") },
      { value: PRODUCT_SORT_VALUES.NAME_ZA, label: t("sortNameZA") },
    ],
    [t],
  );

  const apiParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pageParam),
      pageSize: String(PAGE_SIZE),
      sorts: sortParam,
      filters: "status==published,isAuction==false",
    });
    if (searchQuery) params.set("q", searchQuery);
    if (minPriceParam) params.set("minPrice", minPriceParam);
    if (maxPriceParam) params.set("maxPrice", maxPriceParam);
    if (categoryParam) params.set("category", categoryParam); // Sieve handles cat1|cat2 as OR
    if (brandParam) params.set("brand", brandParam);
    return params.toString();
  }, [
    sortParam,
    pageParam,
    searchQuery,
    minPriceParam,
    maxPriceParam,
    categoryParam,
    brandParam,
  ]);

  const {
    products,
    total: totalItems,
    totalPages,
    isLoading,
  } = useProducts(apiParams, { initialData });

  const { categories: allCategories } = useCategories();
  const { brandOptions } = useBrands();
  const categoryNameMap = useMemo(
    () => new Map(allCategories.map((c) => [c.id, c.name])),
    [allCategories],
  );

  const allCategoryOptions = useMemo(() => {
    if (!products.length) return [];
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return [...cats].sort().map((id) => ({
      value: id,
      label: categoryNameMap.get(id) ?? id,
    }));
  }, [products, categoryNameMap]);

  const activeFilters = useMemo<ActiveFilter[]>(
    () => [
      ...(categoryParam
        ? [
            {
              key: "category",
              label: t("filterCategory"),
              value: categoryParam
                .split("|")
                .filter(Boolean)
                .map((id) => categoryNameMap.get(id) ?? id)
                .join(", "),
            },
          ]
        : []),
      ...(minPriceParam || maxPriceParam
        ? [
            {
              key: "price",
              label: t("filterPriceRange"),
              value: [
                minPriceParam && `₹${minPriceParam}`,
                maxPriceParam && `₹${maxPriceParam}`,
              ]
                .filter(Boolean)
                .join(" – "),
            },
          ]
        : []),
    ],
    [categoryParam, minPriceParam, maxPriceParam, categoryNameMap, t],
  );

  // ── Bulk wishlist handler ─────────────────────────────────────────
  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => addToWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
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
              table={pendingTable}
              categoryOptions={allCategoryOptions}
              brandOptions={brandOptions}
            />
          }
          filterActiveCount={pendingFilterCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
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
                onRemove={(key) => {
                  if (key === "price") {
                    table.setMany({ minPrice: "", maxPrice: "" });
                  } else {
                    table.set(key, "");
                  }
                }}
                onClearAll={onFilterClear}
              />
            ) : undefined
          }
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={
            user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAddToWishlist}
              >
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
          <DataTable
            data={products}
            keyExtractor={(item) => item.id}
            loading={isLoading}
            externalPagination
            columns={[
              { key: "title", header: t("colTitle") },
              { key: "price", header: t("colPrice") },
              { key: "category", header: t("filterCategory") },
              { key: "status", header: t("colStatus") },
            ]}
            defaultViewMode="grid"
            selectable={!!user}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyState={
              <EmptyState
                icon={<PackageSearch className="w-16 h-16" />}
                title={t("noProductsFound")}
                description={t("noProductsSubtitle")}
                actionLabel={
                  activeFilters.length > 0 ? tActions("clearAll") : undefined
                }
                onAction={activeFilters.length > 0 ? onFilterClear : undefined}
              />
            }
            mobileCardRender={(item) => (
              <ProductCard
                product={item as any}
                variant="grid"
                selectable={!!user}
                isSelected={selectedIds.includes(item.id)}
                onSelect={(id, sel) =>
                  setSelectedIds((prev) =>
                    sel ? [...prev, id] : prev.filter((x) => x !== id),
                  )
                }
              />
            )}
          />
        </ListingLayout>
      </div>
    </div>
  );
}
