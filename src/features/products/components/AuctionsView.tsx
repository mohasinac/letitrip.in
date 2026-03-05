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
  AuctionGrid,
  Button,
  FilterFacetSection,
  Heading,
  ListingLayout,
  Pagination,
  Search,
  SortDropdown,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { useAuctions } from "../hooks";
import { wishlistService } from "@/services";

const PAGE_SIZE = 24;

const PRICE_BUCKETS = [
  { value: "0-1000", label: "Under ₹1,000" },
  { value: "1000-5000", label: "₹1,000 – ₹5,000" },
  { value: "5000-20000", label: "₹5,000 – ₹20,000" },
  { value: "20000+", label: "Over ₹20,000" },
];

function AuctionsContent() {
  const t = useTranslations("auctions");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const searchQuery = table.get("q");

  // ── Staged filter state (applied on button click) ──────────────────────
  const [stagedPriceRange, setStagedPriceRange] = useState<string[]>(
    priceRange ? [priceRange] : [],
  );

  useEffect(() => {
    setStagedPriceRange(priceRange ? [priceRange] : []);
  }, [priceRange]);

  const handleFilterApply = useCallback(() => {
    table.setMany({ priceRange: stagedPriceRange[0] ?? "", page: "1" });
  }, [stagedPriceRange, table]);

  const handleFilterClear = useCallback(() => {
    setStagedPriceRange([]);
    table.setMany({ priceRange: "", page: "1" });
  }, [table]);

  const filterActiveCount = priceRange ? 1 : 0;

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
    return sp.toString();
  }, [minBid, maxBid, sort, page, searchQuery]);

  const { auctions, total, totalPages, isLoading } = useAuctions(auctionParams);

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

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!priceRange) return [];
    return [
      {
        key: "priceRange",
        label: t("filterBidRange"),
        value:
          PRICE_BUCKETS.find((b) => b.value === priceRange)?.label ??
          priceRange,
      },
    ];
  }, [priceRange, t]);

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
            <FilterFacetSection
              title={t("filterBidRange")}
              options={PRICE_BUCKETS}
              selected={stagedPriceRange}
              onChange={setStagedPriceRange}
              searchable={false}
            />
          }
          filterActiveCount={filterActiveCount}
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={() => table.set("priceRange", "")}
                onClearAll={() => table.set("priceRange", "")}
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
              <div className="flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={table.setPage}
                />
              </div>
            ) : undefined
          }
        >
          <AuctionGrid
            auctions={auctions}
            loading={isLoading}
            skeletonCount={PAGE_SIZE}
            selectable={!!user}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </ListingLayout>
      </div>
    </div>
  );
}

export function AuctionsView() {
  return (
    <Suspense>
      <AuctionsContent />
    </Suspense>
  );
}
