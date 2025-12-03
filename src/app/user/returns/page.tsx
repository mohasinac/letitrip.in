"use client";

/**
 * User Returns Page
 *
 * @status IMPLEMENTED
 * @epic E008 - Returns Management
 *
 * Displays user's return requests with:
 * - Filter by status
 * - View return details
 * - Track return progress
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Truck,
  RefreshCw,
  Filter,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { returnsService } from "@/services/returns.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import { SimplePagination } from "@/components/common/Pagination";
import { PageState } from "@/components/common/PageState";
import type { ReturnCardFE } from "@/types/frontend/return.types";
import { formatDistanceToNow } from "date-fns";

export default function UserReturnsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [returns, setReturns] = useState<ReturnCardFE[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  const loadReturns = useCallback(async () => {
    await execute(async () => {
      const filters: Record<string, unknown> = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const response = await returnsService.list(filters);
      setReturns(response.data || []);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    });
  }, [statusFilter, currentPage, execute]);

  useEffect(() => {
    if (user) {
      loadReturns();
    }
  }, [user, loadReturns]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { icon: React.ReactNode; color: string; label: string }
    > = {
      pending: {
        icon: <Clock className="w-4 h-4" />,
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Pending Review",
      },
      approved: {
        icon: <CheckCircle className="w-4 h-4" />,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        label: "Approved",
      },
      rejected: {
        icon: <XCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        label: "Rejected",
      },
      "item-received": {
        icon: <Package className="w-4 h-4" />,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        label: "Item Received",
      },
      "refund-processed": {
        icon: <RefreshCw className="w-4 h-4" />,
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        label: "Refund Processed",
      },
      completed: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        label: "Completed",
      },
      escalated: {
        icon: <AlertTriangle className="w-4 h-4" />,
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        label: "Escalated",
      },
    };

    return configs[status] || configs.pending;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      defective: "Defective/Damaged",
      "wrong-item": "Wrong Item",
      "not-as-described": "Not as Described",
      damaged: "Damaged in Transit",
      "changed-mind": "Changed Mind",
      other: "Other Reason",
    };
    return labels[reason] || reason;
  };

  const statusOptions = [
    { value: "all", label: "All Returns" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "item-received", label: "Item Received" },
    { value: "refund-processed", label: "Refunded" },
    { value: "completed", label: "Completed" },
  ];

  if (isLoading && returns.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageState.Error message={error.message} onRetry={loadReturns} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/user"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              My Account
            </Link>
            <span>/</span>
            <span>Returns</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Returns
          </h1>
        </div>
        <Link
          href="/user"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Account
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  statusFilter === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Returns List */}
      {returns.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No returns found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {statusFilter !== "all"
              ? `You don't have any ${statusFilter} returns`
              : "You haven't requested any returns yet"}
          </p>
          <Link
            href="/user/orders"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Package className="w-4 h-4" />
            View your orders
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem) => {
            const statusConfig = getStatusConfig(returnItem.status);

            return (
              <div
                key={returnItem.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Return Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Return #{returnItem.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {returnItem.createdAt &&
                      formatDistanceToNow(new Date(returnItem.createdAt), {
                        addSuffix: true,
                      })}
                  </span>
                </div>

                {/* Return Content */}
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Product Placeholder */}
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>

                    {/* Return Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Return Request
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Order #{returnItem.orderId?.slice(0, 8).toUpperCase()}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Reason:{" "}
                          <span className="font-medium">
                            {returnItem.reasonText ||
                              getReasonLabel(returnItem.reason)}
                          </span>
                        </span>
                        {returnItem.refundAmount && (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Refund: {formatCurrency(returnItem.refundAmount)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/user/orders/${returnItem.orderId}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                        View Order
                      </Link>
                    </div>
                  </div>

                  {/* Return Progress Steps */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <div
                        className={`flex flex-col items-center ${
                          [
                            "pending",
                            "approved",
                            "item-received",
                            "refund-processed",
                            "completed",
                          ].includes(returnItem.status)
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            [
                              "pending",
                              "approved",
                              "item-received",
                              "refund-processed",
                              "completed",
                            ].includes(returnItem.status)
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>Requested</span>
                      </div>

                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          [
                            "approved",
                            "item-received",
                            "refund-processed",
                            "completed",
                          ].includes(returnItem.status)
                            ? "bg-blue-600 dark:bg-blue-400"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />

                      <div
                        className={`flex flex-col items-center ${
                          [
                            "approved",
                            "item-received",
                            "refund-processed",
                            "completed",
                          ].includes(returnItem.status)
                            ? "text-blue-600 dark:text-blue-400"
                            : returnItem.status === "rejected"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            [
                              "approved",
                              "item-received",
                              "refund-processed",
                              "completed",
                            ].includes(returnItem.status)
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : returnItem.status === "rejected"
                              ? "bg-red-100 dark:bg-red-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          {returnItem.status === "rejected" ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
                        <span>
                          {returnItem.status === "rejected"
                            ? "Rejected"
                            : "Approved"}
                        </span>
                      </div>

                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          [
                            "item-received",
                            "refund-processed",
                            "completed",
                          ].includes(returnItem.status)
                            ? "bg-blue-600 dark:bg-blue-400"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />

                      <div
                        className={`flex flex-col items-center ${
                          [
                            "item-received",
                            "refund-processed",
                            "completed",
                          ].includes(returnItem.status)
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            [
                              "item-received",
                              "refund-processed",
                              "completed",
                            ].includes(returnItem.status)
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <span>Received</span>
                      </div>

                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          ["refund-processed", "completed"].includes(
                            returnItem.status
                          )
                            ? "bg-blue-600 dark:bg-blue-400"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      />

                      <div
                        className={`flex flex-col items-center ${
                          ["refund-processed", "completed"].includes(
                            returnItem.status
                          )
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                            ["refund-processed", "completed"].includes(
                              returnItem.status
                            )
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <span>Refunded</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />
    </div>
  );
}
