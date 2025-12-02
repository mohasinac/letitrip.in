"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { RETURN_FILTERS } from "@/constants/filters";
import { returnsService } from "@/services/returns.service";
import { toast } from "@/components/admin/Toast";
import {
  Eye,
  CheckCircle,
  XCircle,
  Package,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { DateDisplay } from "@/components/common/values";

export default function AdminReturnsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);

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
      } as any);
      setReturns(response.data || []);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / 20));
      setTotalReturns(response.count || 0);
    } catch (error: any) {
      // toast.error(error.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this return request?")) return;

    try {
      await returnsService.approve(id, { approved: true });
      toast.success("Return approved");
      loadReturns();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve return");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await returnsService.approve(id, { approved: false, notes: reason });
      toast.success("Return rejected");
      loadReturns();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject return");
    }
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalReturns}
            isLoading={loading}
          />

          <div className="flex-1 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Returns Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Returns
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalReturns}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {returns.filter((r) => r.status === "pending").length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Approved
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {returns.filter((r) => r.status === "approved").length}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {returns.filter((r) => r.status === "completed").length}
                </div>
              </div>
            </div>

            {/* Mobile Return Cards */}
            {isMobile && (
              <div className="space-y-3 lg:hidden">
                {loading ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : returns.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                    No returns found
                  </div>
                ) : (
                  <>
                    {returns.map((returnItem) => (
                      <div
                        key={returnItem.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
                      >
                        {/* Header with ID and status */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Return ID
                            </p>
                            <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {returnItem.id.slice(0, 8)}...
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              returnItem.status === "approved"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : returnItem.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                : returnItem.status === "completed"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                            }`}
                          >
                            {returnItem.status}
                          </span>
                        </div>

                        {/* Customer info */}
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-900 dark:text-white">
                              {returnItem.customerName}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              {returnItem.customerEmail}
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Reason:
                          </span>{" "}
                          <span className="text-gray-900 dark:text-white">
                            {returnItem.reason}
                          </span>
                        </div>

                        {/* Info row */}
                        <div className="flex items-center justify-between text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
                          <button
                            onClick={() =>
                              router.push(`/admin/orders/${returnItem.orderId}`)
                            }
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                          >
                            <Package className="h-4 w-4" />
                            View Order
                          </button>
                          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <DateDisplay
                              date={returnItem.createdAt}
                              format="short"
                            />
                          </span>
                        </div>

                        {/* Actions */}
                        {returnItem.status === "pending" && (
                          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <button
                              onClick={() => handleApprove(returnItem.id)}
                              className="flex-1 py-2 px-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(returnItem.id)}
                              className="flex-1 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Mobile Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1 || loading}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Prev
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages || loading}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg disabled:opacity-50 text-sm"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Desktop Table */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${
                isMobile ? "hidden" : ""
              }`}
            >
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : returns.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No returns found
                </div>
              ) : (
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
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Reason
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
                    {returns.map((returnItem) => (
                      <tr
                        key={returnItem.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                          {returnItem.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              router.push(`/admin/orders/${returnItem.orderId}`)
                            }
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {returnItem.orderId}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {returnItem.customerName}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {returnItem.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {returnItem.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              returnItem.status === "approved"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : returnItem.status === "rejected"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                : returnItem.status === "completed"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                            }`}
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
                          {returnItem.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(returnItem.id)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(returnItem.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              router.push(`/admin/returns/${returnItem.id}`)
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
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-900 dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
