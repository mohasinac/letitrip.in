"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { AUCTION_FILTERS } from "@/constants/filters";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import {
  AdvancedPagination,
  AuctionCardSkeletonGrid,
  EmptyState,
  ErrorBoundary,
  UnifiedFilterSidebar,
  useIsMobile,
  useLoadingState,
  useUrlFilters,
} from "@letitrip/react-library";
import {
  AlertCircle,
  Clock,
  Filter as FilterIcon,
  Gavel,
  Grid,
  List,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function AuctionsContent() {
  const router = useRouter();
  const isMobile = useIsMobile();

  // Use URL filters hook
  const {
    filters,
    updateFilter,
    updateFilters,
    resetFilters: resetUrlFilters,
    sort,
    setSort,
    page,
    setPage,
    limit,
    setLimit,
  } = useUrlFilters({
    initialFilters: {
      status: "active",
      categoryId: "",
      minBid: "",
      maxBid: "",
      featured: "",
      view: "grid",
    },
    initialSort: { field: "created_at", order: "desc" },
    initialPage: 1,
    initialLimit: 12,
  });

  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Extract view from filters
  const view = (filters.view as "grid" | "list") || "grid";

  const loadAuctions = useCallback(async () => {
    await execute(async () => {
      const startAfter = cursors[page - 1];

      // Build filter params
      const apiFilters: any = {
        startAfter: startAfter || undefined,
        limit,
        sortBy: sort?.field || "created_at",
        sortOrder: sort?.order || "desc",
      };

      if (filters.status) apiFilters.status = filters.status;
      if (filters.categoryId) apiFilters.categoryId = filters.categoryId;
      if (filters.minBid) apiFilters.minBid = Number(filters.minBid);
      if (filters.maxBid) apiFilters.maxBid = Number(filters.maxBid);
      if (filters.featured === "true") apiFilters.featured = true;

      const response = await auctionsService.list(apiFilters);
      setAuctions(response.data || []);
      setTotalCount(response.count || 0);

      // Store cursor for next page
      if (
        "hasNextPage" in response.pagination &&
        "nextCursor" in response.pagination
      ) {
        const cursorPagination = response.pagination as any;
        if (cursorPagination.nextCursor && !cursors[page]) {
          setCursors((prev) => {
            const newCursors = [...prev];
            newCursors[page] = cursorPagination.nextCursor || null;
            return newCursors;
          });
        }
      }
    });
  }, [cursors, page, limit, sort, filters, execute]);

  // Load auctions when filters, sort, or page changes
  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleResetFilters = useCallback(() => {
    resetUrlFilters();
    updateFilter("view", "grid");
    updateFilter("status", "active");
    setShowFilters(false);
    setCursors([null]);
  }, [resetUrlFilters, updateFilter]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <button
            onClick={loadAuctions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && auctions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Live Auctions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Bid on unique items and win great deals
          </p>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <UnifiedFilterSidebar
              sections={AUCTION_FILTERS}
              values={filters}
              onChange={(key, value) => updateFilter(key, value)}
              onApply={(pendingValues) => {
                if (pendingValues) updateFilters(pendingValues);
                setCursors([null]);
              }}
              onReset={handleResetFilters}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              searchable={true}
              mobile={true}
              resultCount={totalCount}
              isLoading={isLoading}
            />
          )}

          {/* Auctions Section */}
          <div className="flex-1">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Sort Controls */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap flex-1">
                  <select
                    value={sort?.field || "created_at"}
                    onChange={(e) =>
                      setSort({
                        field: e.target.value,
                        order: sort?.order || "desc",
                      })
                    }
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[48px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  >
                    <option value="created_at">Newest</option>
                    <option value="endTime">Ending Soon</option>
                    <option value="currentPrice">Current Bid</option>
                    <option value="totalBids">Most Bids</option>
                  </select>

                  <select
                    value={sort?.order || "desc"}
                    onChange={(e) =>
                      setSort({
                        field: sort?.field || "created_at",
                        order: e.target.value as "asc" | "desc",
                      })
                    }
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[48px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  >
                    <option value="desc">High to Low</option>
                    <option value="asc">Low to High</option>
                  </select>

                  {/* View Toggle - Hidden on mobile */}
                  <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateFilter("view", "grid")}
                      className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                        view === "grid"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => updateFilter("view", "list")}
                      className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                        view === "list"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
                  >
                    <FilterIcon className="h-5 w-5" />
                    <span>{showFilters ? "Hide" : "Show"} Filters</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {!isLoading && totalCount > 0 && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * limit + 1}-
                {Math.min(page * limit, totalCount)} of {totalCount} results
              </p>
            )}

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                    <Gavel className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Live Auctions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {
                        auctions.filter(
                          (a) => a.status === AuctionStatus.ACTIVE,
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ending Soon
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {
                        auctions.filter((a) => {
                          const diff =
                            new Date(a.endTime).getTime() -
                            new Date().getTime();
                          return (
                            a.status === AuctionStatus.ACTIVE &&
                            diff < 24 * 60 * 60 * 1000
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3">
                    <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Bids
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {auctions.reduce((sum, a) => sum + (a.bidCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auctions Grid/List */}
            {isLoading ? (
              <AuctionCardSkeletonGrid count={view === "grid" ? 12 : 8} />
            ) : auctions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <EmptyState
                  title="No Auctions Found"
                  description="We couldn't find any auctions matching your criteria. Try adjusting your filters."
                  action={{
                    label: "Browse All",
                    onClick: () => router.push("/auctions"),
                  }}
                />
              </div>
            ) : (
              <>
                <CardGrid>
                  {auctions.map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      auction={{
                        id: auction.id,
                        name: auction.name || auction.productName || "",
                        slug: auction.slug || auction.productSlug || "",
                        images:
                          auction.images ||
                          (auction.productImage ? [auction.productImage] : []),
                        currentBid:
                          auction.currentBid ||
                          auction.currentPrice ||
                          auction.startingBid ||
                          0,
                        startingBid: auction.startingBid || 0,
                        bidCount: auction.bidCount || auction.totalBids || 0,
                        endTime: auction.endTime,
                        status: auction.status as any,
                        featured: auction.featured,
                        shop: auction.shopId
                          ? {
                              id: auction.shopId,
                              name: (auction as any).shopName || "Shop",
                            }
                          : undefined,
                      }}
                      showShopInfo={true}
                    />
                  ))}
                </CardGrid>

                {/* Pagination */}
                {totalCount > 0 && (
                  <div className="mt-8">
                    <AdvancedPagination
                      currentPage={page}
                      totalPages={Math.ceil(totalCount / limit)}
                      pageSize={limit}
                      totalItems={totalCount}
                      onPageChange={(newPage) => {
                        setPage(newPage);
                        if (newPage === 1) setCursors([null]);
                        globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
                      }}
                      onPageSizeChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                        setCursors([null]);
                      }}
                      showPageSizeSelector
                      showPageInput
                      showFirstLast
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={AUCTION_FILTERS}
            values={filters}
            onChange={(key, value) => updateFilter(key, value)}
            onApply={(pendingValues) => {
              if (pendingValues) updateFilters(pendingValues);
              setCursors([null]);
              setShowFilters(false);
            }}
            onReset={handleResetFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalCount}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        }
      >
        <AuctionsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
