/**
 * PreOrdersView
 *
 * Displays all active pre-order products with delivery-date filter, sort control,
 * and pagination. URL-driven via useUrlTable.
 *
 * Uses ListingLayout for a unified listing shell.
 */

"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  Heading,
  Text,
  TablePagination,
  Button,
  ListingLayout,
  SortDropdown,
  ActiveFilterChips,
} from "@mohasinac/appkit/ui";
import {
  DataTable,
  FilterFacetSection,
  PreOrderCard,
  Search,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage, useBrands } from "@/hooks";
import { usePreOrders, type PreOrdersListResult } from "../hooks";
import { addToWishlistAction } from "@/actions";

const PAGE_SIZE = 24;

function PreOrdersContent({
  initialData,
}: {
  initialData?: PreOrdersListResult;
}) {
  const t = useTranslations("preOrders");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const PRICE_BUCKETS = useMemo(
    () => [
      { value: "0-1000", label: t("priceBucketUnder1000") },
      { value: "1000-5000", label: t("priceBucket1000to5000") },
      { value: "5000-20000", label: t("priceBucket5000to20000") },
      { value: "20000+", label: t("priceBucketOver20000") },
    ],
    [t],
  );

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "upcoming", label: t("status_upcoming") },
      { value: "in_production", label: t("status_in_production") },
      { value: "ready_to_ship", label: t("status_ready_to_ship") },
    ],
    [t],
  );

  const sortOptions = useMemo(
    () => [
      { value: "preOrderDeliveryDate", label: t("sortDeliverySoonest") },
      { value: "-preOrderDeliveryDate", label: t("sortDeliveryLatest") },
      { value: "price", label: t("sortLowestPrice") },
      { value: "-price", label: t("sortHighestPrice") },
      { value: "-createdAt", label: t("sortNewest") },
    ],
    [t],
  );

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "preOrderDeliveryDate" },
  });
  const sort = table.get("sort") || "preOrderDeliveryDate";
  const page = table.getNumber("page", 1);
  const priceRange = table.get("priceRange");
  const productionStatus = table.get("productionStatus");
  const brandParam = table.get("brand");
  const searchQuery = table.get("q");
  const viewMode = (table.get("view") || "grid") as "grid" | "list";

  // ── Staged filter state ────────────────────────────────────────────────────
  const [stagedPriceRange, setStagedPriceRange] = useState<string[]>(
    priceRange ? [priceRange] : [],
  );
  const [stagedStatus, setStagedStatus] = useState<string[]>(
    productionStatus ? [productionStatus] : [],
  );
  const [stagedBrand, setStagedBrand] = useState<string[]>(
    brandParam ? [brandParam] : [],
  );

  useEffect(() => {
    setStagedPriceRange(priceRange ? [priceRange] : []);
    setStagedStatus(productionStatus ? [productionStatus] : []);
    setStagedBrand(brandParam ? [brandParam] : []);
  }, [priceRange, productionStatus, brandParam]);

  const handleFilterApply = useCallback(() => {
    table.setMany({
      priceRange: stagedPriceRange[0] ?? "",
      productionStatus: stagedStatus[0] ?? "",
      brand: stagedBrand[0] ?? "",
      page: "1",
    });
  }, [stagedPriceRange, stagedStatus, stagedBrand, table]);

  const handleFilterClear = useCallback(() => {
    setStagedPriceRange([]);
    setStagedStatus([]);
    setStagedBrand([]);
    table.setMany({
      priceRange: "",
      productionStatus: "",
      brand: "",
      page: "1",
    });
  }, [table]);

  const filterActiveCount =
    (priceRange ? 1 : 0) + (productionStatus ? 1 : 0) + (brandParam ? 1 : 0);

  const [minPrice, maxPrice] = useMemo(() => {
    if (!priceRange) return ["", ""];
    if (priceRange.endsWith("+")) return [priceRange.replace("+", ""), ""];
    const parts = priceRange.split("-");
    return [parts[0] ?? "", parts[1] ?? ""];
  }, [priceRange]);

  const preOrderParams = useMemo(() => {
    const filterParts = ["isPreOrder==true", "status==published"];
    if (minPrice) filterParts.push(`price>=${minPrice}`);
    if (maxPrice) filterParts.push(`price<=${maxPrice}`);
    if (productionStatus)
      filterParts.push(`preOrderProductionStatus==${productionStatus}`);
    const sp = new URLSearchParams({
      filters: filterParts.join(","),
      sorts: sort,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (searchQuery) sp.set("q", searchQuery);
    if (brandParam) sp.set("brand", brandParam);
    return sp.toString();
  }, [
    minPrice,
    maxPrice,
    productionStatus,
    sort,
    page,
    searchQuery,
    brandParam,
  ]);

  const { preOrders, total, totalPages, isLoading } = usePreOrders(
    preOrderParams,
    { initialData },
  );
  const { brandOptions } = useBrands();

  // ── Bulk wishlist handler ─────────────────────────────────────────────────
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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (priceRange) {
      filters.push({
        key: "priceRange",
        label: t("filterPriceRange"),
        value:
          PRICE_BUCKETS.find((b) => b.value === priceRange)?.label ??
          priceRange,
      });
    }
    if (productionStatus) {
      filters.push({
        key: "productionStatus",
        label: t("filterStatus"),
        value:
          STATUS_OPTIONS.find((s) => s.value === productionStatus)?.label ??
          productionStatus,
      });
    }
    if (brandParam) {
      filters.push({
        key: "brand",
        label: t("filterBrand"),
        value:
          brandOptions.find((b) => b.value === brandParam)?.label ?? brandParam,
      });
    }
    return filters;
  }, [priceRange, productionStatus, brandParam, brandOptions, t]);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <Container className="py-8">
        <ListingLayout
          headerSlot={
            <div>
              <Heading level={1}>{t("title")}</Heading>
              <Text variant="secondary" className="mt-1">
                {total > 0
                  ? t("subtitleWithCount", { count: total })
                  : t("subtitle")}
              </Text>
            </div>
          }
          searchSlot={
            <Search
              value={table.get("q")}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          sortSlot={
            <SortDropdown
              value={sort}
              onChange={table.setSort}
              options={sortOptions}
            />
          }
          filterContent={
            <>
              <FilterFacetSection
                title={t("filterPriceRange")}
                options={PRICE_BUCKETS}
                selected={stagedPriceRange}
                onChange={setStagedPriceRange}
                searchable={false}
              />
              <FilterFacetSection
                title={t("filterStatus")}
                options={STATUS_OPTIONS}
                selected={stagedStatus}
                onChange={setStagedStatus}
                searchable={false}
              />
              {brandOptions.length > 0 && (
                <FilterFacetSection
                  title={t("filterBrand")}
                  options={brandOptions}
                  selected={stagedBrand}
                  onChange={setStagedBrand}
                  searchable={brandOptions.length > 6}
                  selectionMode="single"
                  defaultCollapsed={true}
                />
              )}
            </>
          }
          filterActiveCount={filterActiveCount}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={(key) =>
                  table.set(
                    key === "priceRange"
                      ? "priceRange"
                      : key === "productionStatus"
                        ? "productionStatus"
                        : "brand",
                    "",
                  )
                }
                onClearAll={handleFilterClear}
              />
            ) : undefined
          }
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActionItems={
            user
              ? [
                  {
                    id: "bulk-wishlist",
                    label: tActions("bulkAddToWishlist", {
                      count: selectedIds.length,
                    }),
                    variant: "primary",
                    onClick: handleBulkAddToWishlist,
                  },
                ]
              : undefined
          }
          toolbarPaginationSlot={
            total > 0 ? (
              <TablePagination
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={table.setPage}
                compact
              />
            ) : undefined
          }
        >
          <DataTable
            data={preOrders}
            keyExtractor={(item) => item.id}
            loading={isLoading}
            columns={[
              { key: "title", header: t("colTitle") },
              { key: "price", header: t("colPrice") },
              { key: "preOrderDeliveryDate", header: t("colDelivery") },
              { key: "preOrderProductionStatus", header: t("colStatus") },
            ]}
            showViewToggle
            showTableView={false}
            viewMode={viewMode}
            onViewModeChange={(m) => table.set("view", m)}
            labels={{
              gridView: tActions("gridView"),
              listView: tActions("listView"),
            }}
            mobileCardRender={(item) => (
              <PreOrderCard
                product={item as any}
                variant={viewMode}
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
      </Container>
    </div>
  );
}

export function PreOrdersView({
  initialData,
}: { initialData?: PreOrdersListResult } = {}) {
  return (
    <Suspense>
      <PreOrdersContent initialData={initialData} />
    </Suspense>
  );
}
