/**
 * AuctionsView
 *
 * Extracted from src/app/[locale]/auctions/page.tsx
 * Displays all active auction products with price-range filter, sort control,
 * and pagination. URL-driven via useUrlTable.
 */

"use client";

import { Suspense, useMemo } from "react";
import {
  AuctionGrid,
  Pagination,
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
  SortDropdown,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import { useAuctions } from "../hooks";

const { themed, typography, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

const PRICE_BUCKETS = [
  { value: "0-1000", label: "Under ₹1,000" },
  { value: "1000-5000", label: "₹1,000 – ₹5,000" },
  { value: "5000-20000", label: "₹5,000 – ₹20,000" },
  { value: "20000+", label: "Over ₹20,000" },
];

function AuctionsContent() {
  const t = useTranslations("auctions");

  const sortOptions = [
    { value: "auctionEndDate", label: t("sortEndingSoon") },
    { value: "-auctionEndDate", label: t("sortEndingLatest") },
    { value: "currentBid", label: t("sortLowestBid") },
    { value: "-currentBid", label: t("sortHighestBid") },
    { value: "-bidCount", label: t("sortMostBids") },
  ];

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "auctionEndDate" },
  });
  const sort = table.get("sort") || "auctionEndDate";
  const page = table.getNumber("page", 1);
  const priceRange = table.get("priceRange");

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
    return `filters=${encodeURIComponent(filterParts.join(","))}&sorts=${encodeURIComponent(sort)}&page=${page}&pageSize=${PAGE_SIZE}`;
  }, [minBid, maxBid, sort, page]);

  const { auctions, total, totalPages, isLoading } = useAuctions(auctionParams);

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
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {t("title")}
          </h1>
          <p className={`mt-1 ${themed.textSecondary}`}>{t("subtitle")}</p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className={`text-sm ${themed.textSecondary}`}>
              {t("resultsCount", { count: total })}
            </span>
          )}
          <SortDropdown
            value={sort}
            onChange={table.setSort}
            options={sortOptions}
          />
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={activeFilters.length}
          onClearAll={() => table.set("priceRange", "")}
        >
          <FilterFacetSection
            title={t("filterBidRange")}
            options={PRICE_BUCKETS}
            selected={priceRange ? [priceRange] : []}
            onChange={(vals) => table.set("priceRange", vals[0] ?? "")}
            searchable={false}
          />
        </FilterDrawer>
        <ActiveFilterChips
          filters={activeFilters}
          onRemove={() => table.set("priceRange", "")}
          onClearAll={() => table.set("priceRange", "")}
        />
      </div>

      {/* Auction Grid */}
      <AuctionGrid
        auctions={auctions}
        loading={isLoading}
        skeletonCount={PAGE_SIZE}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={table.setPage}
          />
        </div>
      )}
    </main>
  );
}

export function AuctionsView() {
  return (
    <Suspense>
      <AuctionsContent />
    </Suspense>
  );
}
