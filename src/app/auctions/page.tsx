/**
 * Auctions Listing Page
 *
 * Route: /auctions
 * Displays all active auction products, sorted by ending soonest by default.
 * Reuses AuctionGrid carousel with countdown timers.
 */

"use client";

import { useMemo } from "react";
import {
  AuctionGrid,
  Pagination,
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { useApiQuery, useUrlTable } from "@/hooks";
import type { ProductDocument } from "@/db/schema";

const { themed, typography, spacing } = THEME_CONSTANTS;

const PAGE_SIZE = 24;

type AuctionItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "isAuction"
  | "auctionEndDate"
  | "startingBid"
  | "currentBid"
  | "bidCount"
  | "featured"
>;

interface ProductsResponse {
  data: AuctionItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const PRICE_BUCKETS = [
  { value: "0-1000", label: "Under ₹1,000" },
  { value: "1000-5000", label: "₹1,000 – ₹5,000" },
  { value: "5000-20000", label: "₹5,000 – ₹20,000" },
  { value: "20000+", label: "Over ₹20,000" },
];

const SORT_OPTIONS = [
  { value: "auctionEndDate", label: UI_LABELS.AUCTIONS_PAGE.SORT_ENDING_SOON },
  { value: "-auctionEndDate", label: "Ending Latest" },
  { value: "currentBid", label: UI_LABELS.AUCTIONS_PAGE.SORT_LOWEST_BID },
  { value: "-currentBid", label: UI_LABELS.AUCTIONS_PAGE.SORT_HIGHEST_BID },
  { value: "-bidCount", label: UI_LABELS.AUCTIONS_PAGE.SORT_MOST_BIDS },
];

export default function AuctionsPage() {
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

  const { data, isLoading } = useApiQuery<ProductsResponse>({
    queryKey: ["auctions", table.params.toString()],
    queryFn: () => {
      const filterParts = ["isAuction==true", "status==published"];
      if (minBid) filterParts.push(`currentBid>=${minBid}`);
      if (maxBid) filterParts.push(`currentBid<=${maxBid}`);
      const filters = encodeURIComponent(filterParts.join(","));
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${filters}&sorts=${encodeURIComponent(sort)}&page=${page}&pageSize=${PAGE_SIZE}`;
      return fetch(url).then((r) => r.json());
    },
  });

  const auctions = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!priceRange) return [];
    return [
      {
        key: "priceRange",
        label: "Bid Range",
        value:
          PRICE_BUCKETS.find((b) => b.value === priceRange)?.label ??
          priceRange,
      },
    ];
  }, [priceRange]);
  const activeFilterCount = activeFilters.length;

  return (
    <main
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${spacing.stack}`}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {UI_LABELS.AUCTIONS_PAGE.TITLE}
          </h1>
          <p className={`mt-1 ${themed.textSecondary}`}>
            {UI_LABELS.AUCTIONS_PAGE.SUBTITLE}
          </p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className={`text-sm ${themed.textSecondary}`}>
              {UI_LABELS.AUCTIONS_PAGE.RESULTS_COUNT(total)}
            </span>
          )}
          <select
            value={sort}
            onChange={(e) => table.set("sort", e.target.value)}
            className={`h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterDrawer
          activeCount={activeFilterCount}
          onClearAll={() => table.set("priceRange", "")}
        >
          <FilterFacetSection
            title="Bid Range"
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
