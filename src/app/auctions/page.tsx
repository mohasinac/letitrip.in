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
} from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState, EmptyStates } from "@/components/common/EmptyState";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { AuctionCardSkeletonGrid } from "@/components/common/skeletons/AuctionCardSkeleton";
import { AUCTION_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { formatDistanceToNow } from "date-fns";

function AuctionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

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

  // Sync filter values with URL on mount
  useEffect(() => {
    const initialFilters: Record<string, any> = {};
    if (status) initialFilters.status = status;
    if (featured) initialFilters.featured = featured;
    setFilterValues(initialFilters);
    // Load on mount
    loadAuctions();
  }, []);

  // Update URL when sort/page changes (not filters - those wait for Apply)
  useEffect(() => {
    updateUrlAndLoad();
  }, [sortBy, sortOrder, currentPage]);

  const updateUrlAndLoad = useCallback(() => {
    const params = new URLSearchParams();
    if (filterValues.status) params.set("status", filterValues.status);
    if (filterValues.categoryId)
      params.set("categoryId", filterValues.categoryId);
    if (filterValues.minBid) params.set("minBid", String(filterValues.minBid));
    if (filterValues.maxBid) params.set("maxBid", String(filterValues.maxBid));
    if (filterValues.featured) params.set("featured", "true");
    if (sortBy !== "created_at") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("page", String(currentPage));

    const newUrl = params.toString() ? `?${params.toString()}` : "/auctions";
    router.push(newUrl, { scroll: false });

    loadAuctions();
  }, [filterValues, sortBy, sortOrder, currentPage]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = useCallback(() => {
    setFilterValues({});
    setShowFilters(false);
    setCurrentPage(1);
    setCursors([null]);
    setTimeout(() => updateUrlAndLoad(), 0);
  }, [updateUrlAndLoad]);

  const renderPagination = () => {
    if (!hasNextPage && currentPage === 1) return null;

    return (
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
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
              window.scrollTo({ top: 0, behavior: "smooth" });
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

  const getTimeRemaining = (endTime: Date | null | undefined) => {
    if (!endTime) return "Ended";

    const now = new Date();
    const end = new Date(endTime);

    // Check if date is valid
    if (isNaN(end.getTime())) return "Ended";

    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 24) {
      return `${hours}h ${minutes}m left`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
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
              setTimeout(() => updateUrlAndLoad(), 0);
            }}
            onReset={handleResetFilters}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={false}
            resultCount={totalCount}
            isLoading={loading}
          />
        )}

        {/* Auctions Section */}
        <div className="flex-1">
          {/* Controls - No Search (use main search bar) */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
            >
              <FilterIcon className="h-5 w-5" />
              <span>{showFilters ? "Hide" : "Show"} Filters</span>
            </button>

            {/* View Toggle - Hidden on mobile */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                  view === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-4 py-3 min-h-[48px] touch-manipulation ${
                  view === "list"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}{" "}
              results
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
                      auctions.filter((a) => a.status === AuctionStatus.ACTIVE)
                        .length
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
                          new Date(a.endTime).getTime() - new Date().getTime();
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
          {loading ? (
            <AuctionCardSkeletonGrid count={view === "grid" ? 12 : 8} />
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm">
              <EmptyStates.NoAuctions
                action={{
                  label: "Browse All",
                  onClick: () => router.push("/auctions"),
                }}
              />
            </div>
          ) : view === "grid" ? (
            <CardGrid>
              {auctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.slug}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  {auction.images && auction.images[0] && (
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      <img
                        src={auction.images[0]}
                        alt={auction.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {auction.featured && (
                        <div className="absolute top-2 right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                          ★ Featured
                        </div>
                      )}
                      {auction.status === AuctionStatus.ACTIVE && (
                        <div className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          Live
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {auction.name}
                    </h3>

                    {/* Bid Info */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Current Bid:
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ₹
                          {(
                            auction.currentBid ||
                            auction.startingBid ||
                            0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bids:</span>
                        <span className="font-medium text-gray-900">
                          {auction.bidCount || 0}
                        </span>
                      </div>
                      {auction.status === AuctionStatus.ACTIVE && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Left:</span>
                          <span className="font-medium text-red-600">
                            {getTimeRemaining(auction.endTime)}
                          </span>
                        </div>
                      )}
                      {auction.status === "scheduled" && (
                        <div className="text-sm text-blue-600">
                          Starts{" "}
                          {formatDistanceToNow(
                            new Date(auction.startTime || 0),
                            {
                              addSuffix: true,
                            }
                          )}
                        </div>
                      )}
                    </div>

                    {/* CTA - Mobile Optimized */}
                    <button
                      className={`mt-4 w-full rounded-lg px-4 py-3 min-h-[48px] text-sm font-medium transition-colors touch-manipulation ${
                        auction.status === AuctionStatus.ACTIVE
                          ? "bg-primary text-white hover:bg-primary/90 active:bg-primary/80"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {auction.status === AuctionStatus.ACTIVE
                        ? "Place Bid"
                        : "View Details"}
                    </button>
                  </div>
                </Link>
              ))}
            </CardGrid>
          ) : (
            <div className="space-y-4">
              {auctions.map((auction) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.slug}`}
                  className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray-200 bg-white hover:border-primary hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  {auction.images && auction.images[0] && (
                    <div className="relative w-full sm:w-48 aspect-video sm:aspect-square overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                      <img
                        src={auction.images[0]}
                        alt={auction.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {auction.featured && (
                        <div className="absolute top-2 right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                          ★ Featured
                        </div>
                      )}
                      {auction.status === AuctionStatus.ACTIVE && (
                        <div className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          Live
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {auction.name}
                      </h3>

                      {/* Bid Info */}
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div>
                          <span className="text-xs text-gray-600">
                            Current Bid
                          </span>
                          <p className="text-xl font-bold text-primary">
                            ₹
                            {(
                              auction.currentBid ||
                              auction.startingBid ||
                              0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Bids</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {auction.bidCount || 0}
                          </p>
                        </div>
                        {auction.status === AuctionStatus.ACTIVE && (
                          <div>
                            <span className="text-xs text-gray-600">
                              Time Left
                            </span>
                            <p className="text-lg font-semibold text-red-600">
                              {getTimeRemaining(auction.endTime)}
                            </p>
                          </div>
                        )}
                        {auction.status === "scheduled" && (
                          <div>
                            <span className="text-xs text-gray-600">
                              Starts
                            </span>
                            <p className="text-sm text-blue-600">
                              {formatDistanceToNow(
                                new Date(auction.startTime || 0),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      className={`mt-4 sm:mt-0 sm:self-end rounded-lg px-6 py-3 min-h-[48px] text-sm font-medium transition-colors touch-manipulation ${
                        auction.status === AuctionStatus.ACTIVE
                          ? "bg-primary text-white hover:bg-primary/90 active:bg-primary/80"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {auction.status === AuctionStatus.ACTIVE
                        ? "Place Bid"
                        : "View Details"}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
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
            setTimeout(() => updateUrlAndLoad(), 0);
          }}
          onReset={handleResetFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalCount}
          isLoading={loading}
        />
      )}
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
