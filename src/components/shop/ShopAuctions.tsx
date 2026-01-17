"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import {
  AuctionFilters,
  AuctionFilterValues,
  EmptyState,
} from "@letitrip/react-library";
import { Filter as FilterIcon, Grid, List, Loader2 } from "lucide-react";
import { useState } from "react";

export interface ShopAuctionsProps {
  auctions: AuctionCardFE[];
  loading?: boolean;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  isVerified?: boolean;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onFiltersChange?: (filters: AuctionFilterValues) => void;
  className?: string;
}

/**
 * ShopAuctions Component
 *
 * Displays shop auctions with filtering and sorting.
 * Extracted from shop detail page for reusability.
 *
 * Features:
 * - Auction grid/list view toggle
 * - Filters sidebar (status, bid range, featured, ending soon)
 * - Sort by end time/current bid/total bids
 * - Responsive layout
 * - Empty state handling
 *
 * @example
 * ```tsx
 * <ShopAuctions
 *   auctions={auctions}
 *   shopId="shop123"
 *   shopName="My Shop"
 *   onSortChange={handleSort}
 *   onFiltersChange={handleFilters}
 * />
 * ```
 */
export function ShopAuctions({
  auctions,
  loading = false,
  shopId,
  shopName,
  shopLogo,
  isVerified = false,
  onSortChange,
  onFiltersChange,
  className = "",
}: ShopAuctionsProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuctionFilterValues>({
    sortBy: "endTime",
    sortOrder: "asc",
  });

  const handleFiltersChange = (newFilters: AuctionFilterValues) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange?.(filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters: AuctionFilterValues = {
      sortBy: "endTime",
      sortOrder: "asc",
    };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Auction Filters Sidebar */}
      <aside className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
        <div className="lg:sticky lg:top-4">
          <AuctionFilters
            filters={filters}
            onChange={handleFiltersChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </div>
      </aside>

      {/* Auctions Section */}
      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Controls */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Filter Toggle (Mobile) */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FilterIcon className="h-5 w-5" />
                Filters
              </button>

              <div className="flex-1"></div>

              {/* View Toggle */}
              <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`px-3 py-2 ${
                    view === "grid"
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`px-3 py-2 ${
                    view === "list"
                      ? "bg-purple-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Auctions Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : auctions.length === 0 ? (
            <EmptyState
              title="No auctions found"
              description="This shop hasn't created any auctions yet"
            />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {auctions.length} auction
                {auctions.length !== 1 ? "s" : ""}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    auction={{
                      id: auction.id,
                      name: auction.productName || "",
                      slug: auction.productSlug || "",
                      images: auction.productImage
                        ? [auction.productImage]
                        : [],
                      currentBid:
                        auction.currentPrice || auction.startingBid || 0,
                      startingBid: auction.startingBid || 0,
                      bidCount: auction.totalBids || 0,
                      endTime: auction.endTime,
                      status: auction.status as any,
                      featured: (auction as any).featured,
                      shop: {
                        id: shopId,
                        name: shopName,
                        logo: shopLogo,
                        isVerified,
                      },
                    }}
                    showShopInfo={false}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopAuctions;
