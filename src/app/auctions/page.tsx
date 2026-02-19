/**
 * Auctions Listing Page
 *
 * Route: /auctions
 * Displays all active auction products, sorted by ending soonest by default.
 * Reuses AuctionGrid carousel with countdown timers.
 */

"use client";

import { useMemo, useState } from "react";
import { AuctionGrid } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { useApiQuery } from "@/hooks";
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
  const [sort, setSort] = useState("auctionEndDate");
  const [page, setPage] = useState(1);

  const productsUrl = useMemo(() => {
    const filters = encodeURIComponent("isAuction==true,status==published");
    return `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${filters}&sorts=${encodeURIComponent(sort)}&page=${page}&pageSize=${PAGE_SIZE}`;
  }, [sort, page]);

  const { data, isLoading } = useApiQuery<ProductsResponse>({
    queryKey: ["auctions", sort, String(page)],
    queryFn: () => fetch(productsUrl).then((r) => r.json()),
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
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
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
      {total > PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.BACK}
          </button>
          <span className={`px-4 py-2 text-sm ${themed.textSecondary}`}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40"
          >
            {UI_LABELS.ACTIONS.NEXT}
          </button>
        </div>
      )}
    </main>
  );
}
