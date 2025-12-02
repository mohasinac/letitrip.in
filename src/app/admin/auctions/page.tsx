"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Gavel,
  Clock,
  TrendingUp,
  Download,
  Play,
  Square,
  XCircle,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { safeToISOString } from "@/lib/date-utils";
import {
  BulkActionBar,
  TableCheckbox,
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { getAuctionBulkActions } from "@/constants/bulk-actions";
import { auctionsService } from "@/services/auctions.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import type { AuctionFiltersBE } from "@/types/backend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { AUCTION_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";

export default function AdminAuctionsPage() {
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters
  const [filterValues, setFilterValues] = useState<Partial<AuctionFiltersBE>>(
    {}
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const limit = 20;

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    live: 0,
    scheduled: 0,
    ended: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (user && isAdmin) {
      loadAuctions();
      loadStats();
    }
  }, [user, isAdmin, searchQuery, filterValues, currentPage]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: Partial<AuctionFiltersBE> = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ...filterValues,
      };

      const response = await auctionsService.list(filters);

      setAuctions(response.data || []);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / limit));
      setTotalAuctions(response.count || 0);
    } catch (error) {
      console.error("Failed to load auctions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load auctions"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load stats for each status
      const [liveRes, scheduledRes, endedRes, cancelledRes] = await Promise.all(
        [
          auctionsService.list({ status: AuctionStatus.ACTIVE, limit: 1 }),
          auctionsService.list({ status: AuctionStatus.SCHEDULED, limit: 1 }),
          auctionsService.list({ status: AuctionStatus.ENDED, limit: 1 }),
          auctionsService.list({ status: AuctionStatus.CANCELLED, limit: 1 }),
        ]
      );

      setStats({
        live: liveRes.count || 0,
        scheduled: scheduledRes.count || 0,
        ended: endedRes.count || 0,
        cancelled: cancelledRes.count || 0,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  // Fields configuration for inline edit
  // Bulk actions configuration
  const bulkActions = getAuctionBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);

      // Map actions to status updates
      const actionMap: Record<string, any> = {
        start: { status: "live" as AuctionStatus },
        end: { status: "ended" as AuctionStatus },
        cancel: { status: "cancelled" as AuctionStatus },
        feature: { featured: true },
        unfeature: { featured: false },
      };

      if (actionId === "delete") {
        // Delete auctions
        await Promise.all(
          selectedIds.map(async (id) => {
            await auctionsService.delete(id);
          })
        );
      } else {
        // Update auctions
        await Promise.all(
          selectedIds.map(async (id) => {
            await auctionsService.update(id, actionMap[actionId]);
          })
        );
      }

      await loadAuctions();
      await loadStats();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await auctionsService.delete(id);
      await loadAuctions();
      await loadStats();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete auction:", error);
      toast.error("Failed to delete auction");
    }
  };

  const exportAuctions = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Status",
      "Current Bid",
      "Reserve Price",
      "Start Time",
      "End Time",
      "Bid Count",
      "Shop",
      "Featured",
    ];
    const rows = auctions.map((a) => [
      a.name || a.productName,
      a.status,
      a.currentBid || a.startingBid || a.currentPrice,
      a.reservePrice || "",
      a.startTime
        ? safeToISOString(new Date(a.startTime)) ?? ""
        : safeToISOString(new Date(a.endTime)) ?? "",
      safeToISOString(new Date(a.endTime)) ?? "",
      a.bidCount || a.totalBids || 0,
      a.shopId || "",
      a.featured ? "Yes" : "No",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auctions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeLeft = (endTime: Date) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: AuctionStatus) => {
    switch (status) {
      case AuctionStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case AuctionStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800";
      case AuctionStatus.ENDED:
        return "bg-gray-100 text-gray-800";
      case AuctionStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && auctions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadAuctions}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auctions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all auctions across the platform ({totalAuctions} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportAuctions}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Live</p>
              <p className="text-2xl font-bold text-gray-900">{stats.live}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.scheduled}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <Square className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelled}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search auctions by title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters {showFilters ? "▲" : "▼"}
        </button>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 mb-4">
          <BulkActionBar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            loading={actionLoading}
            resourceName="auction"
          />
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={AUCTION_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={totalAuctions}
            isLoading={loading}
          />
        )}

        {/* Table/Grid Content */}
        <div className="flex-1 min-w-0">
          {view === "table" ? (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <TableCheckbox
                          checked={
                            selectedIds.length === auctions.length &&
                            auctions.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < auctions.length
                          }
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedIds(
                                auctions
                                  .map((a) => a.id)
                                  .filter(Boolean) as string[]
                              );
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Bid
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Left
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bids
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auctions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-sm text-gray-500"
                        >
                          <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <p className="font-medium">No auctions found</p>
                          <p className="mt-1">
                            Try adjusting your search or filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      auctions.map((auction) => (
                        <tr
                          key={auction.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <TableCheckbox
                              checked={selectedIds.includes(auction.id!)}
                              onChange={(checked) => {
                                if (checked) {
                                  setSelectedIds([...selectedIds, auction.id!]);
                                } else {
                                  setSelectedIds(
                                    selectedIds.filter(
                                      (id) => id !== auction.id
                                    )
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {auction.images && auction.images[0] && (
                                <div className="relative h-10 w-10">
                                  <OptimizedImage
                                    src={auction.images[0]}
                                    alt={auction.name || "Auction image"}
                                    fill
                                    className="rounded object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <Link
                                  href={`/auctions/${auction.slug}`}
                                  className="font-medium text-gray-900 hover:text-primary"
                                >
                                  {auction.name}
                                </Link>
                                {auction.featured && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                auction.status
                              )}`}
                            >
                              {auction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(
                                auction.currentBid ||
                                  auction.startingBid ||
                                  auction.currentPrice
                              )}
                            </div>
                            {auction.reservePrice && (
                              <div className="text-xs text-gray-500">
                                Reserve: {formatPrice(auction.reservePrice)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">
                              {auction.status === AuctionStatus.ACTIVE
                                ? formatTimeLeft(auction.endTime)
                                : auction.status === AuctionStatus.SCHEDULED
                                ? "Not started"
                                : "Ended"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <TrendingUp className="h-4 w-4 text-gray-400" />
                              {auction.bidCount || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/auctions/${auction.slug}`}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/seller/auctions/${auction.slug}/edit`}
                                className="p-1 text-gray-400 hover:text-primary"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteId(auction.id!)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="font-medium text-gray-900">No auctions found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {auction.images && auction.images[0] ? (
                        <div className="relative w-full h-48">
                          <OptimizedImage
                            src={auction.images[0]}
                            alt={auction.name || "Auction"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Gavel className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <TableCheckbox
                          checked={selectedIds.includes(auction.id!)}
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedIds([...selectedIds, auction.id!]);
                            } else {
                              setSelectedIds(
                                selectedIds.filter((id) => id !== auction.id)
                              );
                            }
                          }}
                        />
                      </div>
                      {auction.featured && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-400 text-yellow-900">
                            Featured
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            auction.status
                          )}`}
                        >
                          {auction.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link
                        href={`/auctions/${auction.slug}`}
                        className="font-medium text-gray-900 hover:text-primary line-clamp-1"
                      >
                        {auction.name}
                      </Link>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Current Bid</span>
                          <span className="font-bold text-gray-900">
                            {formatPrice(
                              auction.currentBid ||
                                auction.startingBid ||
                                auction.currentPrice
                            )}
                          </span>
                        </div>

                        {auction.status === AuctionStatus.ACTIVE && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Time Left</span>
                            <span className="font-medium text-primary">
                              {formatTimeLeft(auction.endTime)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Bids</span>
                          <span className="font-medium text-gray-900">
                            {auction.bidCount || 0}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Link
                          href={`/auctions/${auction.slug}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        <Link
                          href={`/seller/auctions/${auction.slug}/edit`}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page{" "}
                    <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Auction"
          onConfirm={() => handleDelete(deleteId)}
          onClose={() => setDeleteId(null)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        >
          Are you sure you want to delete this auction? This action cannot be
          undone and all bids will be refunded.
        </ConfirmDialog>
      )}
    </div>
  );
}
