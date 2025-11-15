"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  BulkActionBar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { RETURN_FILTERS } from "@/constants/filters";
import { returnsService } from "@/services/returns.service";
import { toast } from "@/components/admin/Toast";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function AdminReturnsPage() {
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [selectedReturns, setSelectedReturns] = useState<Set<string>>(
    new Set()
  );
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
      });
      setReturns(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalReturns(response.total || 0);
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
      <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Returns Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Returns</div>
                <div className="text-2xl font-bold">{totalReturns}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {returns.filter((r) => r.status === "pending").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Approved</div>
                <div className="text-2xl font-bold text-green-600">
                  {returns.filter((r) => r.status === "approved").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {returns.filter((r) => r.status === "completed").length}
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
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reason
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
                      <tr key={returnItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">
                          {returnItem.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() =>
                              router.push(`/admin/orders/${returnItem.orderId}`)
                            }
                            className="text-indigo-600 hover:underline"
                          >
                            {returnItem.orderId}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{returnItem.customerName}</div>
                          <div className="text-gray-500">
                            {returnItem.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {returnItem.reason}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              returnItem.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : returnItem.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : returnItem.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {returnItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(returnItem.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {returnItem.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(returnItem.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleReject(returnItem.id)}
                                className="text-red-600 hover:text-red-900"
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
    </AuthGuard>
  );
}
