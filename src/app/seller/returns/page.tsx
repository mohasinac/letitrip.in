"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Price, DateDisplay } from "@/components/common/values";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import {
  UnifiedFilterSidebar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { RETURN_FILTERS } from "@/constants/filters";
import { returnsService } from "@/services/returns.service";
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

export default function SellerReturnsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [returns, setReturns] = useState<ReturnCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Partial<ReturnFiltersFE>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReturns();
  }, [filterValues, currentPage]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const response = await returnsService.list({
        ...filterValues,
        page: currentPage,
        limit: 20,
      });
      setReturns(response.data || []);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / 20));
      setTotalReturns(response.count || 0);
    } catch (error) {
      logComponentError("SellerReturnsPage", "loadReturns", error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await returnsService.approve(id, { approved: true });
      await loadReturns();
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
      await loadReturns();
    } catch (error) {
      logComponentError("SellerReturnsPage", "handleReject", error as Error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "item-received":
        return "bg-blue-100 text-blue-800";
      case "refund-processed":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "escalated":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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
              isLoading={loading}
              showInlineSearch={true}
              inlineSearchValue={searchQuery}
              onInlineSearchChange={setSearchQuery}
              inlineSearchPlaceholder="Search returns..."
            />

            <div className="flex-1 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Returns Management
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Total Returns</div>
                  <div className="text-2xl font-bold">{totalReturns}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {returns.filter((r) => r.status === "requested").length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Approved</div>
                  <div className="text-2xl font-bold text-green-600">
                    {returns.filter((r) => r.status === "approved").length}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Needs Attention</div>
                  <div className="text-2xl font-bold text-red-600">
                    {returns.filter((r) => r.status === "escalated").length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : returns.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No returns found
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    {isMobile && (
                      <div className="lg:hidden space-y-4 p-4">
                        {returns.map((returnItem) => (
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
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Return ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Reason
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {returns.map((returnItem) => (
                            <tr
                              key={returnItem.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 text-sm font-mono">
                                {returnItem.id.substring(0, 8)}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/seller/orders/${returnItem.orderId}`
                                    )
                                  }
                                  className="text-sm text-indigo-600 hover:text-indigo-900 font-mono"
                                >
                                  {returnItem.orderId.substring(0, 8)}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center">
                                  {returnItem.status === "escalated" && (
                                    <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                                  )}
                                  {getReasonLabel(returnItem.reason)}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold">
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
                              <td className="px-6 py-4 text-sm text-gray-500">
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
                                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
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
                                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
                                  className="text-indigo-600 hover:text-indigo-900"
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

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </AuthGuard>
  );
}
