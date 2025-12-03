"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  Gavel,
  Loader2,
  Clock,
  TrendingUp,
  Grid,
  List,
  Filter as FilterIcon,
  AlertCircle,
} from "lucide-react";
import AuctionCard from "@/components/cards/AuctionCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState, EmptyStates } from "@/components/common/EmptyState";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { AuctionCardSkeletonGrid } from "@/components/common/skeletons/AuctionCardSkeleton";
import { AUCTION_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { auctionsService } from "@/services/auctions.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";

function AuctionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Cursor-based pagination
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const status = searchParams.get("status") as AuctionStatus | null;
  const featured = searchParams.get("featured");
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const itemsPerPage = 12;

  const loadAuctions = useCallback(async () => {
    await execute(async () => {
      const startAfter = cursors[currentPage - 1];

      const apiFilters: any = {
        startAfter: startAfter || undefined,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        ...filterValues,
      };

      if (status) {
        apiFilters.status = status;
      } else if (!filterValues.status) {
        apiFilters.status = "active"; // Default to active auctions
      }

      if (featured === "true") {
        apiFilters.featured = true;
      }

      const response = await auctionsService.list(apiFilters);
      setAuctions(response.data || []);
      setTotalCount(response.count || 0);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store cursor for next page
        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }
    });
  }, [
    cursors,
    currentPage,
    itemsPerPage,
    sortBy,
    sortOrder,
    filterValues,
    status,
    featured,
    execute,
  ]);

  // Sync filter values with URL on mount
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    if (status) initialFilters.status = status;
    if (featured) initialFilters.featured = featured;
    setFilterValues(initialFilters);
  }, [status, featured]);

  // Reload when sort/page/filters change via URL
  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleResetFilters = useCallback(() => {
    setFilterValues({});
    setShowFilters(false);
    setCurrentPage(1);
    setCursors([null]);
    // Clear URL and reload
    router.push("/auctions", { scroll: false });
  }, [router]);

  const renderPagination = () => {
    if (!hasNextPage && currentPage === 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={currentPage === 1}
          className="px-6 py-3 min-h-[48px] rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Page {currentPage}
        </span>

        <button
          onClick={() => {
            if (hasNextPage) {
              setCurrentPage(currentPage + 1);
              globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
            }
          }}
          disabled={!hasNextPage}
          className="px-6 py-3 min-h-[48px] rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          Next
        </button>
      </div>
    );
  };

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
              values={filterValues}
              onChange={(key, value) => {
                setFilterValues((prev) => ({ ...prev, [key]: value }));
              }}
              onApply={(pendingValues) => {
                if (pendingValues) setFilterValues(pendingValues);
                setCurrentPage(1);
                setCursors([null]);
                // Update URL with new filter values and reload
                const params = new URLSearchParams();
                if (pendingValues?.status)
                  params.set("status", pendingValues.status);
                if (pendingValues?.categoryId)
                  params.set("categoryId", pendingValues.categoryId);
                if (pendingValues?.minBid)
                  params.set("minBid", String(pendingValues.minBid));
                if (pendingValues?.maxBid)
                  params.set("maxBid", String(pendingValues.maxBid));
                if (pendingValues?.featured) params.set("featured", "true");
                if (sortBy !== "created_at") params.set("sortBy", sortBy);
                if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
                const newUrl = params.toString()
                  ? `/auctions?${params.toString()}`
                  : "/auctions";
                router.push(newUrl, { scroll: false });
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
                    value={sortBy}
                    onChange={(e) => {
                      const newSortBy = e.target.value;
                      // Update URL with new sort
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.set("sortBy", newSortBy);
                      router.push(`/auctions?${params.toString()}`, {
                        scroll: false,
                      });
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[48px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  >
                    <option value="created_at">Newest</option>
                    <option value="endTime">Ending Soon</option>
                    <option value="currentPrice">Current Bid</option>
                    <option value="totalBids">Most Bids</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      const newSortOrder = e.target.value as "asc" | "desc";
                      // Update URL with new sort order
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.set("sortOrder", newSortOrder);
                      router.push(`/auctions?${params.toString()}`, {
                        scroll: false,
                      });
                    }}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[48px] text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  >
                    <option value="desc">High to Low</option>
                    <option value="asc">Low to High</option>
                  </select>

                  {/* View Toggle - Hidden on mobile */}
                  <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setView("grid")}
                      className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                        view === "grid"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setView("list")}
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
            {!isLoading && (
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalCount)} of{" "}
                {totalCount} results
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

            {/* Auctions Grid/List - Using unified AuctionCard component */}
            {isLoading ? (
              <AuctionCardSkeletonGrid count={view === "grid" ? 12 : 8} />
            ) : auctions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <EmptyStates.NoAuctions
                  action={{
                    label: "Browse All",
                    onClick: () => router.push("/auctions"),
                  }}
                />
              </div>
            ) : (
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
            )}

            {/* Pagination */}
            {renderPagination()}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={AUCTION_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({ ...prev, [key]: value }));
            }}
            onApply={(pendingValues) => {
              if (pendingValues) setFilterValues(pendingValues);
              setCurrentPage(1);
              setCursors([null]);
              setShowFilters(false);
              // Update URL with new filter values and reload
              const params = new URLSearchParams();
              if (pendingValues?.status)
                params.set("status", pendingValues.status);
              if (pendingValues?.categoryId)
                params.set("categoryId", pendingValues.categoryId);
              if (pendingValues?.minBid)
                params.set("minBid", String(pendingValues.minBid));
              if (pendingValues?.maxBid)
                params.set("maxBid", String(pendingValues.maxBid));
              if (pendingValues?.featured) params.set("featured", "true");
              if (sortBy !== "created_at") params.set("sortBy", sortBy);
              if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
              const newUrl = params.toString()
                ? `/auctions?${params.toString()}`
                : "/auctions";
              router.push(newUrl, { scroll: false });
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
