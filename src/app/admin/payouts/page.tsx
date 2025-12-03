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
import { toast } from "@/components/admin/Toast";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { DateDisplay } from "@/components/common/values";

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(
    new Set(),
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
  }, [filterValues, currentPage, searchQuery]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const response = await payoutsService.getPayouts({
        ...filterValues,
        search: searchQuery || undefined,
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
      toast.success("Payout processed");
      loadPayouts();
    } catch (error: any) {
      toast.error(error.message || "Failed to process payout");
    }
  };

  const handleRejectPayout = async (id: string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    try {
      await payoutsService.cancelPayout(id, reason);
      toast.success("Payout rejected");
      loadPayouts();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payout");
    }
  };

  const handleBulkProcess = async () => {
    if (selectedPayouts.size === 0) {
      toast.error("Please select payouts first");
      return;
    }

    if (!confirm(`Process ${selectedPayouts.size} payouts?`)) return;

    try {
      const result = await payoutsService.bulkProcess(
        Array.from(selectedPayouts),
      );
      toast.success(
        `${result.success} payouts processed, ${result.failed} failed`,
      );
      setSelectedPayouts(new Set());
      loadPayouts();
    } catch (error: any) {
      toast.error(error.message || "Bulk processing failed");
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              setSearchQuery("");
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalPayouts}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search payouts..."
          />

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Seller Payouts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Process and manage seller payout requests
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Requests
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Processed
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.processed}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Rejected
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : payouts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No payout requests found</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
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
                                new Set(payouts.map((p) => p.id)),
                              );
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Shop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
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
                        <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">
                          {payout.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {payout.sellerName}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {payout.sellerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {payout.shopName}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payout.status === "processed"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                                : payout.status === "rejected"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          <DateDisplay date={payout.createdAt} format="short" />
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {payout.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleProcessPayout(payout.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Process"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectPayout(payout.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
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
