"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Price, DateDisplay } from "@/components/common/values";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { StatsCardGrid, StatsCard } from "@/components/common/StatsCard";
import { SimplePagination } from "@/components/common/Pagination";
import {
  UnifiedFilterSidebar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { RETURN_FILTERS } from "@/constants/filters";
import { returnsService } from "@/services/returns.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import type {
  ReturnCardFE,
  ReturnFiltersFE,
} from "@/types/frontend/return.types";
import { logComponentError } from "@/lib/error-logger";
import {
  Eye,
  CheckCircle,
  XCircle,
  Package,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

interface ReturnsData {
  returns: ReturnCardFE[];
  totalPages: number;
  totalReturns: number;
}

export default function SellerReturnsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data, isLoading, execute } = useLoadingState<ReturnsData>({
    initialData: { returns: [], totalPages: 1, totalReturns: 0 },
  });
  const [filterValues, setFilterValues] = useState<Partial<ReturnFiltersFE>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");

  const returns = data?.returns || [];
  const totalPages = data?.totalPages || 1;
  const totalReturns = data?.totalReturns || 0;

  const loadReturns = useCallback(async () => {
    try {
      const response = await returnsService.list({
        ...filterValues,
        page: currentPage,
        limit: 20,
      });
      return {
        returns: response.data || [],
        totalPages: Math.ceil((response.count || 0) / 20),
        totalReturns: response.count || 0,
      };
    } catch (error) {
      logComponentError("SellerReturnsPage", "loadReturns", error as Error);
      return { returns: [], totalPages: 1, totalReturns: 0 };
    }
  }, [filterValues, currentPage]);

  useEffect(() => {
    execute(loadReturns);
  }, [execute, loadReturns]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await returnsService.approve(id, { approved: true });
      await execute(loadReturns);
    } catch (error) {
      logComponentError("SellerReturnsPage", "handleApprove", error as Error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, notes?: string) => {
    try {
      setProcessingId(id);
      await returnsService.approve(id, {
        approved: false,
        notes: notes || "Return request rejected by seller",
      });
      await execute(loadReturns);
    } catch (error) {
      logComponentError("SellerReturnsPage", "handleReject", error as Error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "item-received":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "refund-processed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "escalated":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      defective: "Defective/Damaged",
      "wrong-item": "Wrong Item",
      "not-as-described": "Not as Described",
      damaged: "Damaged",
      "changed-mind": "Changed Mind",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  return (
    <AuthGuard requireAuth allowedRoles={["seller"]}>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Mobile Filter Toggle */}
          {isMobile && (
            <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
              >
                <Filter className="w-4 h-4" />
                <span>{showFilters ? "Hide" : "Show"} Filters</span>
              </button>
            </div>
          )}

          <div className="flex">
            <UnifiedFilterSidebar
              sections={RETURN_FILTERS}
              values={filterValues}
              onChange={(key, value) => {
                setFilterValues((prev) => ({
                  ...prev,
                  [key]: value,
                }));
              }}
              onApply={() => {
                setCurrentPage(1);
                if (isMobile) setShowFilters(false);
              }}
              onReset={() => {
                setFilterValues({});
                setSearchQuery("");
                setCurrentPage(1);
              }}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              searchable={true}
              mobile={isMobile}
              resultCount={totalReturns}
              isLoading={isLoading}
              showInlineSearch={true}
              inlineSearchValue={searchQuery}
              onInlineSearchChange={setSearchQuery}
              inlineSearchPlaceholder="Search returns..."
            />

            <div className="flex-1 p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Returns Management
              </h1>

              <StatsCardGrid columns={4} className="mb-6">
                <StatsCard title="Total Returns" value={totalReturns} />
                <StatsCard
                  title="Pending Review"
                  value={
                    (returns || []).filter((r) => r.status === "requested")
                      .length
                  }
                  className="[&_p:last-child]:!text-yellow-600 dark:[&_p:last-child]:!text-yellow-400"
                />
                <StatsCard
                  title="Approved"
                  value={
                    (returns || []).filter((r) => r.status === "approved")
                      .length
                  }
                  className="[&_p:last-child]:!text-green-600 dark:[&_p:last-child]:!text-green-400"
                />
                <StatsCard
                  title="Needs Attention"
                  value={
                    (returns || []).filter((r) => r.status === "escalated")
                      .length
                  }
                  className="[&_p:last-child]:!text-red-600 dark:[&_p:last-child]:!text-red-400"
                />
              </StatsCardGrid>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : (returns || []).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No returns found
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    {isMobile && (
                      <div className="lg:hidden space-y-4 p-4">
                        {(returns || []).map((returnItem) => (
                          <div
                            key={returnItem.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-mono text-sm text-gray-900 dark:text-white">
                                  #{returnItem.id.substring(0, 8)}
                                </h3>
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/seller/orders/${returnItem.orderId}`
                                    )
                                  }
                                  className="text-sm text-indigo-600 hover:text-indigo-900 font-mono"
                                >
                                  Order: {returnItem.orderId.substring(0, 8)}
                                </button>
                              </div>
                              <span
                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  returnItem.status
                                )}`}
                              >
                                {returnItem.status}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm mb-3">
                              <div className="flex items-center gap-2">
                                {returnItem.status === "escalated" && (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                )}
                                <span className="text-gray-500 dark:text-gray-400">
                                  Reason:
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {getReasonLabel(returnItem.reason)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Amount:
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {returnItem.refundAmount ? (
                                    <Price amount={returnItem.refundAmount} />
                                  ) : (
                                    "N/A"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Date:
                                </span>
                                <DateDisplay
                                  date={returnItem.createdAt}
                                  format="short"
                                  className="text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>

                            {returnItem.status === "requested" && (
                              <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                                <button
                                  onClick={() => handleApprove(returnItem.id)}
                                  disabled={processingId === returnItem.id}
                                  className="flex-1 py-2 text-center text-green-600 font-medium border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = prompt(
                                      "Reason for rejection (optional):"
                                    );
                                    if (notes !== null) {
                                      handleReject(returnItem.id, notes);
                                    }
                                  }}
                                  disabled={processingId === returnItem.id}
                                  className="flex-1 py-2 text-center text-red-600 font-medium border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}

                            {returnItem.status !== "requested" && (
                              <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/seller/orders/${returnItem.orderId}`
                                    )
                                  }
                                  className="flex-1 py-2 text-center text-indigo-600 font-medium border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors text-sm flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Order
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Desktop Table */}
                    <div className={isMobile ? "hidden" : ""}>
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Return ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {(returns || []).map((returnItem) => (
                            <tr
                              key={returnItem.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                                {returnItem.id.substring(0, 8)}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/seller/orders/${returnItem.orderId}`
                                    )
                                  }
                                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-mono"
                                >
                                  {returnItem.orderId.substring(0, 8)}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="flex items-center">
                                  {returnItem.status === "escalated" && (
                                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                                  )}
                                  {getReasonLabel(returnItem.reason)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                {returnItem.refundAmount ? (
                                  <Price amount={returnItem.refundAmount} />
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    returnItem.status
                                  )}`}
                                >
                                  {returnItem.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                <DateDisplay
                                  date={returnItem.createdAt}
                                  format="short"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm space-x-2">
                                {returnItem.status === "requested" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleApprove(returnItem.id)
                                      }
                                      disabled={processingId === returnItem.id}
                                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:opacity-50"
                                      title="Approve Return"
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        const notes = prompt(
                                          "Reason for rejection (optional):"
                                        );
                                        if (notes !== null) {
                                          handleReject(returnItem.id, notes);
                                        }
                                      }}
                                      disabled={processingId === returnItem.id}
                                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                                      title="Reject Return"
                                    >
                                      <XCircle className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/seller/returns/${returnItem.id}`
                                    )
                                  }
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
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
      </ErrorBoundary>
    </AuthGuard>
  );
}
