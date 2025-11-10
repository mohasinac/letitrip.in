"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  BulkActionBar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { payoutsService } from "@/services/payouts.service";
import { PAYOUT_FILTERS } from "@/constants/filters";
// TODO: Add toast notifications when library is configured
import { Eye, Download, CheckCircle, XCircle } from "lucide-react";

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processed: 0,
    rejected: 0,
    totalAmount: 0,
  });

  const PAYOUT_FILTERS = [
    {
      id: "status",
      label: "Status",
      type: "checkbox" as const,
      options: [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "processed", label: "Processed" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      id: "dateRange",
      label: "Date Range",
      type: "date-range" as const,
    },
  ];

  useEffect(() => {
    loadPayouts();
  }, [filterValues, currentPage]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const response = await payoutsService.getPayouts({
        ...filterValues,
        page: currentPage,
        limit: 20,
      });
      setPayouts(response.payouts || []);
      setTotalPages(Math.ceil(response.total / response.limit));
      setTotalPayouts(response.total);

      // Load stats
      const statsData = await payoutsService.getPayoutStats();
      setStats({
        total:
          statsData.totalCompleted +
          statsData.totalPending +
          statsData.totalProcessing +
          statsData.totalFailed,
        pending: statsData.totalPending,
        processed: statsData.totalCompleted,
        rejected: statsData.totalFailed,
        totalAmount: statsData.completedAmount,
      });
    } catch (error: any) {
      // toast.error(error.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (id: string) => {
    if (!confirm("Process this payout?")) return;

    try {
      const transactionId = prompt("Enter transaction ID:");
      if (!transactionId) return;

      await payoutsService.processPayout(id, transactionId);
      // toast.success("Payout processed");
      loadPayouts();
    } catch (error: any) {
      // toast.error(error.message || "Failed to process payout");
    }
  };

  const handleRejectPayout = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await payoutsService.cancelPayout(id, reason);
      // toast.success("Payout rejected");
      loadPayouts();
    } catch (error: any) {
      // toast.error(error.message || "Failed to reject payout");
    }
  };

  const handleBulkProcess = async () => {
    if (selectedPayouts.size === 0) {
      // toast.error("Please select payouts first");
      return;
    }

    if (!confirm(`Process ${selectedPayouts.size} payouts?`)) return;

    try {
      const result = await payoutsService.bulkProcess(
        Array.from(selectedPayouts)
      );
      // toast.success(`${result.success} payouts processed, ${result.failed} failed`);
      setSelectedPayouts(new Set());
      loadPayouts();
    } catch (error: any) {
      // toast.error(error.message || "Bulk processing failed");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Filter Sidebar */}
          <UnifiedFilterSidebar
            sections={PAYOUT_FILTERS as any}
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
            resultCount={totalPayouts}
            isLoading={loading}
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Seller Payouts
              </h1>
              <p className="text-gray-600 mt-2">
                Process and manage seller payout requests
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Requests</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Processed</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.processed}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Rejected</div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Amount</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.totalAmount)}
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedPayouts.size > 0 && (
              <div className="sticky top-16 z-10 mb-4">
                <BulkActionBar
                  selectedCount={selectedPayouts.size}
                  actions={[
                    {
                      id: "process",
                      label: "Process Selected",
                      variant: "success",
                    },
                  ]}
                  onAction={handleBulkProcess}
                  onClearSelection={() => setSelectedPayouts(new Set())}
                  loading={false}
                  resourceName="payout"
                />
              </div>
            )}

            {/* Payouts Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : payouts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No payout requests found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <TableCheckbox
                          checked={selectedPayouts.size === payouts.length}
                          indeterminate={
                            selectedPayouts.size > 0 &&
                            selectedPayouts.size < payouts.length
                          }
                          onChange={() => {
                            if (selectedPayouts.size === payouts.length) {
                              setSelectedPayouts(new Set());
                            } else {
                              setSelectedPayouts(
                                new Set(payouts.map((p) => p.id))
                              );
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Shop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <TableCheckbox
                            checked={selectedPayouts.has(payout.id)}
                            onChange={(checked) => {
                              const newSelected = new Set(selectedPayouts);
                              if (checked) {
                                newSelected.add(payout.id);
                              } else {
                                newSelected.delete(payout.id);
                              }
                              setSelectedPayouts(newSelected);
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-mono">
                          {payout.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{payout.sellerName}</div>
                          <div className="text-gray-500">
                            {payout.sellerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{payout.shopName}</td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payout.status === "processed"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {payout.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleProcessPayout(payout.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Process"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectPayout(payout.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() =>
                              router.push(`/admin/payouts/${payout.id}`)
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

            {/* Pagination */}
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
