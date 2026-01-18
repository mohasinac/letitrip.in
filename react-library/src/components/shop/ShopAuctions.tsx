"use client";

import { Filter as FilterIcon, Grid, List, Loader2 } from "lucide-react";
import { useState } from "react";

interface Auction {
  id: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  currentPrice: number;
  startingBid: number;
  totalBids: number;
  endTime: string;
  status: string;
  featured?: boolean;
}

export interface ShopAuctionFilterValues {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  minBid?: number;
  maxBid?: number;
  featured?: boolean;
  endingSoon?: boolean;
  [key: string]: any;
}

export interface ShopAuctionsProps {
  auctions: Auction[];
  loading?: boolean;
  shopId: string;
  shopName: string;
  shopLogo?: string;
  isVerified?: boolean;
  showShopInfo?: boolean;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onFiltersChange?: (filters: ShopAuctionFilterValues) => void;
  className?: string;
  // Injected components
  AuctionCardComponent?: React.ComponentType<any>;
  AuctionFiltersComponent?: React.ComponentType<any>;
  EmptyStateComponent?: React.ComponentType<{
    title: string;
    description: string;
  }>;
}

/**
 * ShopAuctions Component
 *
 * Pure React component for displaying shop auctions with filtering and sorting.
 * Framework-independent implementation with callback injection pattern.
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
 *   AuctionCardComponent={AuctionCard}
 *   AuctionFiltersComponent={AuctionFilters}
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
  showShopInfo = false,
  onSortChange,
  onFiltersChange,
  className = "",
  AuctionCardComponent,
  AuctionFiltersComponent,
  EmptyStateComponent,
}: ShopAuctionsProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ShopAuctionFilterValues>({
    sortBy: "endTime",
    sortOrder: "asc",
  });

  // Default EmptyState component (fallback)
  const EmptyState =
    EmptyStateComponent ||
    (({ title, description }: { title: string; description: string }) => (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    ));

  const handleFiltersChange = (newFilters: ShopAuctionFilterValues) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange?.(filters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters: ShopAuctionFilterValues = {
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
          {AuctionFiltersComponent ? (
            <AuctionFiltersComponent
              filters={filters}
              onChange={handleFiltersChange}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-500">Filters not available</div>
            </div>
          )}
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
                aria-label="Toggle filters"
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
                  aria-label="Grid view"
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
                  aria-label="List view"
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
              {AuctionCardComponent ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((auction) => (
                    <AuctionCardComponent
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
                        status: auction.status,
                        featured: auction.featured,
                        shop: {
                          id: shopId,
                          name: shopName,
                          logo: shopLogo,
                          isVerified,
                        },
                      }}
                      showShopInfo={showShopInfo}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Auction card component not provided
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopAuctions;

