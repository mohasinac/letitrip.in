"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Gavel,
  Loader2,
  Clock,
  TrendingUp,
  Star,
  Grid,
  List,
  Search,
  Filter as FilterIcon,
} from "lucide-react";
import Link from "next/link";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import {
  AuctionFilters,
  type AuctionFilterValues,
} from "@/components/filters/AuctionFilters";
import { auctionsService } from "@/services/auctions.service";
import type { Auction, AuctionStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function AuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState<AuctionFilterValues>({
    sortBy: "endTime",
    sortOrder: "asc",
  });

  const status = searchParams.get("status") as AuctionStatus | null;
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 12;

  useEffect(() => {
    loadAuctions();
  }, [status, featured, page, filters, searchQuery]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const apiFilters: any = {
        page,
        limit: itemsPerPage,
        ...filters,
      };

      if (status) {
        apiFilters.status = status;
      } else if (!filters.status) {
        apiFilters.status = "live"; // Default to live auctions
      }

      if (featured === "true") {
        apiFilters.isFeatured = true;
      }

      if (searchQuery) {
        apiFilters.search = searchQuery;
      }

      const response = await auctionsService.list(apiFilters);
      setAuctions(response.data || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    loadAuctions();
  };

  const handleResetFilters = () => {
    setFilters({
      sortBy: "endTime",
      sortOrder: "asc",
    });
    setSearchQuery("");
    setShowFilters(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = page < totalPages - 2;

    if (showEllipsisStart) {
      pages.push(1);
      if (page > 4) pages.push("...");
    }

    for (
      let i = Math.max(1, page - 2);
      i <= Math.min(totalPages, page + 2);
      i++
    ) {
      pages.push(i);
    }

    if (showEllipsisEnd) {
      if (page < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => router.push(`/auctions?page=${page - 1}`)}
          disabled={page === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => router.push(`/auctions?page=${p}`)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                page === p
                  ? "bg-primary text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={i} className="px-2 text-gray-400">
              {p}
            </span>
          )
        )}
        <button
          onClick={() => router.push(`/auctions?page=${page + 1}`)}
          disabled={page === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const end = new Date(endTime);
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
        <h1 className="text-3xl font-bold text-gray-900">Live Auctions</h1>
        <p className="mt-2 text-gray-600">
          Bid on unique items and win great deals
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside
          className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
        >
          <div className="lg:sticky lg:top-4">
            <AuctionFilters
              filters={filters}
              onChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Auctions Section */}
        <div className="flex-1">
          {/* Search & Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FilterIcon className="h-5 w-5" />
              Filters
            </button>

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2 ${
                  view === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 ${
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
            <p className="mb-4 text-sm text-gray-600">
              Showing {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, totalCount)} of {totalCount}{" "}
              results
            </p>
          )}

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <Gavel className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Live Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter((a) => a.status === "live").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ending Soon</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      auctions.filter((a) => {
                        const diff =
                          new Date(a.endTime).getTime() - new Date().getTime();
                        return (
                          a.status === "live" && diff < 24 * 60 * 60 * 1000
                        );
                      }).length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.reduce((sum, a) => sum + a.bidCount, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Grid/List */}
          {auctions.length === 0 ? (
            <EmptyState
              title="No auctions found"
              description="Check back later for new auctions"
              action={{
                label: "Browse All",
                onClick: () => router.push("/auctions"),
              }}
            />
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
                      {auction.isFeatured && (
                        <div className="absolute top-2 right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                          ★ Featured
                        </div>
                      )}
                      {auction.status === "live" && (
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
                          ₹{auction.currentBid.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bids:</span>
                        <span className="font-medium text-gray-900">
                          {auction.bidCount}
                        </span>
                      </div>
                      {auction.status === "live" && (
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
                          {formatDistanceToNow(new Date(auction.startTime), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                      {auction.status === "live" ? "Place Bid" : "View Details"}
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
                      {auction.isFeatured && (
                        <div className="absolute top-2 right-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                          ★ Featured
                        </div>
                      )}
                      {auction.status === "live" && (
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
                            ₹{auction.currentBid.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Bids</span>
                          <p className="text-lg font-semibold text-gray-900">
                            {auction.bidCount}
                          </p>
                        </div>
                        {auction.status === "live" && (
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
                                new Date(auction.startTime),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button className="mt-4 sm:mt-0 sm:self-end rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                      {auction.status === "live" ? "Place Bid" : "View Details"}
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
    </div>
  );
}
