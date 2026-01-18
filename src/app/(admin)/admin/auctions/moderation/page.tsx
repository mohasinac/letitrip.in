"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { StatsCard, StatsCardGrid } from "@letitrip/react-library";
import { AUCTION_FILTERS } from "@/constants/filters";
import { auctionsService } from "@/services/auctions.service";
import { AuctionStatus } from "@/types/shared/common.types";
import {
  DateDisplay,
  OptimizedImage,
  Price,
  SimplePagination,
  UnifiedFilterSidebar,
  useLoadingState,
} from "@letitrip/react-library";
import { CheckCircle, Clock, Edit, Eye, Flag, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AuctionModerationPage() {
  const router = useRouter();
  const {
    data: auctions,
    isLoading: loading,
    execute: loadAuctions,
  } = useLoadingState<any[]>({ initialData: [] });
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    status: ["pending"],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchAuctions = useCallback(async () => {
    const response = await auctionsService.list({
      ...filterValues,
      page: currentPage,
      limit: 20,
    });
    setTotalPages(Math.ceil((response.count || 0) / 20));
    setTotalAuctions(response.count || 0);
    return response.data || [];
  }, [filterValues, currentPage]);

  useEffect(() => {
    loadAuctions(fetchAuctions);
  }, [fetchAuctions, loadAuctions]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await auctionsService.update(id, { status: AuctionStatus.SCHEDULED });
      await loadAuctions(fetchAuctions);
    } catch (error: any) {
      console.error("Failed to approve auction:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      setProcessingId(id);
      await auctionsService.update(id, { status: AuctionStatus.CANCELLED });
      await loadAuctions(fetchAuctions);
    } catch (error: any) {
      console.error("Failed to reject auction:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFlag = async (id: string) => {
    const reason = prompt("Flag reason:");
    if (!reason) return;

    try {
      setProcessingId(id);
      // In a real app, this would call a flag endpoint
      toast.success(`Auction ${id} flagged for: ${reason}`);
      await loadAuctions(fetchAuctions);
    } catch (error: any) {
      console.error("Failed to flag auction:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount;
  };

  const formatDateTime = (date: Date | string) => {
    return date as any;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeUntilStart = (startTime: Date | string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff < 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
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
              setFilterValues({ status: ["pending"] });
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalAuctions}
            isLoading={loading}
          />

          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Auction Moderation
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve pending auctions
              </p>
            </div>

            <StatsCardGrid columns={4} className="mb-6">
              <StatsCard title="Total Auctions" value={totalAuctions} />
              <StatsCard
                title="Pending Review"
                value={
                  (auctions || []).filter((a) => a.status === "pending").length
                }
                className="[&_p:last-child]:!text-yellow-600"
              />
              <StatsCard
                title="Scheduled"
                value={
                  (auctions || []).filter((a) => a.status === "scheduled")
                    .length
                }
                className="[&_p:last-child]:!text-blue-600"
              />
              <StatsCard
                title="Live Now"
                value={
                  (auctions || []).filter((a) => a.status === "live").length
                }
                className="[&_p:last-child]:!text-green-600"
              />
            </StatsCardGrid>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (auctions || []).length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No auctions found
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Shop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Starting Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(auctions || []).map((auction) => (
                      <tr key={auction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {auction.images?.[0] && (
                              <div className="relative w-12 h-12 mr-3">
                                <OptimizedImage
                                  src={auction.images[0]}
                                  alt={auction.name || "Auction"}
                                  width={48}
                                  height={48}
                                  objectFit="cover"
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {auction.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {auction.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {auction.shopName || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          <Price amount={auction.startingBid} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {auction.status === "pending" ||
                            auction.status === "scheduled" ? (
                              `Starts in ${getTimeUntilStart(
                                auction.startTime
                              )}`
                            ) : (
                              <DateDisplay
                                date={auction.startTime}
                                format="short"
                              />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Ends:{" "}
                            <DateDisplay
                              date={auction.endTime}
                              format="short"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              auction.status
                            )}`}
                          >
                            {auction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {auction.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(auction.id)}
                                  disabled={processingId === auction.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(auction.id)}
                                  disabled={processingId === auction.id}
                                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/auctions/${auction.id}/edit`
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleFlag(auction.id)}
                              disabled={processingId === auction.id}
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              title="Flag"
                            >
                              <Flag className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/auctions/${auction.slug}`)
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <SimplePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-6"
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
