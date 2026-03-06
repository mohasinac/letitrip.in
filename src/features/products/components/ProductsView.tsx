"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageSearch, Gavel } from "lucide-react";
import {
  DataTable,
  FilterFacetSection,
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
import type { ActiveFilter } from "@/components";
import { Heading, Text, TextLink } from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { useProducts } from "../hooks";
import { wishlistService } from "@/services";

const PAGE_SIZE = 24;

const PRICE_BUCKETS = [
  { value: "0-500", labelKey: "priceUnder500" },
  { value: "500-2000", labelKey: "price500to2000" },
  { value: "2000-10000", labelKey: "price2000to10000" },
  { value: "10000+", labelKey: "priceOver10000" },
] as const;

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
  const priceRange = table.get("priceRange");
  const searchQuery = table.get("q");
  const sortParam = table.get("sort") || PRODUCT_SORT_VALUES.NEWEST;
  const pageParam = table.getNumber("page", 1);

  // ── Staged filter state ──────────────────────────────────────────────
  const [stagedCategory, setStagedCategory] = useState<string[]>(
    categoryParam ? [categoryParam] : [],
  );
  const [stagedPriceRange, setStagedPriceRange] = useState<string[]>(
    priceRange ? [priceRange] : [],
  );

  useEffect(() => {
    setStagedCategory(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);

  useEffect(() => {
    setStagedPriceRange(priceRange ? [priceRange] : []);
  }, [priceRange]);

  const handleFilterApply = useCallback(() => {
    table.setMany({
      category: stagedCategory[0] ?? "",
      priceRange: stagedPriceRange[0] ?? "",
    });
  }, [stagedCategory, stagedPriceRange, table]);

  const handleFilterClear = useCallback(() => {
    setStagedCategory([]);
    setStagedPriceRange([]);
    table.setMany({ category: "", priceRange: "" });
  }, [table]);

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

  const priceBucketOptions = useMemo(
    () => PRICE_BUCKETS.map((b) => ({ value: b.value, label: t(b.labelKey) })),
    [t],
  );

  const filtersStr = useMemo(() => {
    const parts = ["status==published"];
    if (categoryParam) parts.push(`category==${categoryParam}`);
    if (priceRange) {
      if (priceRange.endsWith("+")) {
        parts.push(`price>=${priceRange.replace("+", "")}`);
      } else {
        const [min, max] = priceRange.split("-");
        if (min) parts.push(`price>=${min}`);
        if (max) parts.push(`price<=${max}`);
      }
    }
    return parts.join(",");
  }, [categoryParam, priceRange]);

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

  const activeFilters = useMemo<ActiveFilter[]>(
    () => [
      ...(categoryParam
        ? [
            {
              key: "category",
              label: t("filterCategory"),
              value: categoryParam,
            },
          ]
        : []),
      ...(priceRange
        ? [
            {
              key: "priceRange",
              label: t("filterPriceRange"),
              value:
                priceBucketOptions.find((b) => b.value === priceRange)?.label ??
                priceRange,
            },
          ]
        : []),
    ],
    [categoryParam, priceRange, priceBucketOptions, t],
  );

  // ── Bulk wishlist handler ─────────────────────────────────────────
  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => wishlistService.add(id)),
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
            <>
              <FilterFacetSection
                title={t("filterCategory")}
                options={allCategoriesFromData.map((c) => ({
                  value: c,
                  label: c,
                }))}
                selected={stagedCategory}
                onChange={setStagedCategory}
                selectionMode="single"
                searchable={allCategoriesFromData.length > 6}
              />
              <FilterFacetSection
                title={t("filterPriceRange")}
                options={priceBucketOptions}
                selected={stagedPriceRange}
                onChange={setStagedPriceRange}
                selectionMode="single"
                searchable={false}
              />
            </>
          }
          filterActiveCount={activeFilters.length}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
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
                onClearAll={handleFilterClear}
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
            columns={[
              { key: "title", header: t("colTitle") },
              { key: "price", header: t("colPrice") },
              { key: "category", header: t("filterCategory") },
              { key: "status", header: t("colStatus") },
            ]}
            showViewToggle
            viewMode={
              (table.get("view") || "grid") as "table" | "grid" | "list"
            }
            onViewModeChange={(m) => table.set("view", m)}
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
                onAction={
                  activeFilters.length > 0 ? handleFilterClear : undefined
                }
              />
            }
            mobileCardRender={(item) => (
              <ProductCard
                product={item as any}
                variant={
                  (table.get("view") || "grid") === "list" ? "list" : "grid"
                }
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
