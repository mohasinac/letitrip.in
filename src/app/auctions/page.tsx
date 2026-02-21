/**
 * Auctions Listing Page
 *
 * Route: /auctions
 * Displays all active auction products, sorted by ending soonest by default.
 * Reuses AuctionGrid carousel with countdown timers.
 */

"use client";

import { useMemo } from "react";
import { AuctionGrid, Pagination } from "@/components";
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

  const { data, isLoading } = useApiQuery<ProductsResponse>({
    queryKey: ["auctions", table.params.toString()],
    queryFn: () => {
      const filters = encodeURIComponent("isAuction==true,status==published");
      const url = `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${filters}&sorts=${encodeURIComponent(sort)}&page=${page}&pageSize=${PAGE_SIZE}`;
      return fetch(url).then((r) => r.json());
    },
  });

  const auctions = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

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
