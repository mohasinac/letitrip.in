/**
 * AuctionsView
 *
 * Extracted from src/app/[locale]/auctions/page.tsx
 * Displays all active auction products with price-range filter, sort control,
 * and pagination. URL-driven via useUrlTable.
 *
 * Uses ListingLayout for a unified listing shell.
 */

"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActiveFilterChips,
  AuctionCard,
  Button,
  DataTable,
  FilterFacetSection,
  Heading,
  ListingLayout,
  Search,
  SortDropdown,
  TablePagination,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage, useBrands } from "@/hooks";
import { useAuctions } from "../hooks";
import type { AuctionsListResult } from "../hooks";
import { addToWishlistAction } from "@/actions";

const PAGE_SIZE = 24;

function AuctionsContent({
  initialData,
}: {
  initialData?: AuctionsListResult;
}) {
  const t = useTranslations("auctions");
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

  const sortOptions = useMemo(
    () => [
      { value: "auctionEndDate", label: t("sortEndingSoon") },
      { value: "-auctionEndDate", label: t("sortEndingLatest") },
      { value: "currentBid", label: t("sortLowestBid") },
      { value: "-currentBid", label: t("sortHighestBid") },
      { value: "-bidCount", label: t("sortMostBids") },
    ],
    [t],
  );

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "auctionEndDate" },
  });
  const sort = table.get("sort") || "auctionEndDate";
  const page = table.getNumber("page", 1);
  const priceRange = table.get("priceRange");
  const brandParam = table.get("brand");
  const searchQuery = table.get("q");

  // ── Staged filter state (applied on button click) ──────────────────────
  const [stagedPriceRange, setStagedPriceRange] = useState<string[]>(
    priceRange ? [priceRange] : [],
  );
  const [stagedBrand, setStagedBrand] = useState<string[]>(
    brandParam ? [brandParam] : [],
  );

  useEffect(() => {
    setStagedPriceRange(priceRange ? [priceRange] : []);
    setStagedBrand(brandParam ? [brandParam] : []);
  }, [priceRange, brandParam]);

  const handleFilterApply = useCallback(() => {
    table.setMany({
      priceRange: stagedPriceRange[0] ?? "",
      brand: stagedBrand[0] ?? "",
      page: "1",
    });
  }, [stagedPriceRange, stagedBrand, table]);

  const handleFilterClear = useCallback(() => {
    setStagedPriceRange([]);
    setStagedBrand([]);
    table.setMany({ priceRange: "", brand: "", page: "1" });
  }, [table]);

  const filterActiveCount = (priceRange ? 1 : 0) + (brandParam ? 1 : 0);

  const [minBid, maxBid] = useMemo(() => {
    if (!priceRange) return ["", ""];
    if (priceRange.endsWith("+")) return [priceRange.replace("+", ""), ""];
    const parts = priceRange.split("-");
    return [parts[0] ?? "", parts[1] ?? ""];
  }, [priceRange]);

  const auctionParams = useMemo(() => {
    const filterParts = ["isAuction==true", "status==published"];
    if (minBid) filterParts.push(`currentBid>=${minBid}`);
    if (maxBid) filterParts.push(`currentBid<=${maxBid}`);
    const sp = new URLSearchParams({
      filters: filterParts.join(","),
      sorts: sort,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (searchQuery) sp.set("q", searchQuery);
    if (brandParam) sp.set("brand", brandParam);
    return sp.toString();
  }, [minBid, maxBid, sort, page, searchQuery, brandParam]);

  const { auctions, total, totalPages, isLoading } = useAuctions(
    auctionParams,
    { initialData },
  );
  const { brandOptions } = useBrands();

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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (priceRange) {
      filters.push({
        key: "priceRange",
        label: t("filterBidRange"),
        value:
          PRICE_BUCKETS.find((b) => b.value === priceRange)?.label ??
          priceRange,
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
  }, [priceRange, brandParam, brandOptions, t]);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <div className={`${THEME_CONSTANTS.page.container["2xl"]} py-8`}>
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
                title={t("filterBidRange")}
                options={PRICE_BUCKETS}
                selected={stagedPriceRange}
                onChange={setStagedPriceRange}
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
                  key === "brand"
                    ? table.set("brand", "")
                    : table.set("priceRange", "")
                }
                onClearAll={() => table.setMany({ priceRange: "", brand: "" })}
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
            total > 0 ? (
              <TablePagination
                total={total}
                currentPage={page}
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
            data={auctions}
            keyExtractor={(item) => item.id}
            loading={isLoading}
            columns={[
              { key: "title", header: t("colTitle") },
              { key: "currentBid", header: t("colCurrentBid") },
              { key: "auctionEndDate", header: t("colEnds") },
              { key: "bidCount", header: t("colBids") },
            ]}
            defaultViewMode="grid"
            selectable={!!user}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            mobileCardRender={(item) => (
              <AuctionCard
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

export function AuctionsView({
  initialData,
}: { initialData?: AuctionsListResult } = {}) {
  return (
    <Suspense>
      <AuctionsContent initialData={initialData} />
    </Suspense>
  );
}
