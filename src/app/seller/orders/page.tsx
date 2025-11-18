"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  UnifiedFilterSidebar,
  TableCheckbox,
} from "@/components/common/inline-edit";
import { ORDER_FILTERS } from "@/constants/filters";
import { ordersService } from "@/services/orders.service";
import { Eye, Package, Truck, ChevronLeft, ChevronRight } from "lucide-react";

export default function SellerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filters from URL
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    status: searchParams.get("status") || "",
    sortBy: searchParams.get("sortBy") || "created_at",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterValues.status) params.set("status", filterValues.status);
    if (filterValues.sortBy) params.set("sortBy", filterValues.sortBy);
    if (filterValues.sortOrder) params.set("sortOrder", filterValues.sortOrder);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [filterValues]);

  useEffect(() => {
    loadOrders();
  }, [filterValues, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const startAfter = cursors[currentPage - 1];
      const response = await ordersService.getSellerOrders({
        ...filterValues,
        startAfter,
        limit: 20,
      } as any);

      setOrders(response.data || []);
      setTotalOrders(response.count || 0);

      // Check if it's cursor pagination
      if ("hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in response.pagination) {
          const cursorPagination = response.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ordersService.updateStatus(id, status as any);
      loadOrders();
    } catch (error: any) {
      console.error("Failed to update status:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <AuthGuard requireAuth allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <UnifiedFilterSidebar
            sections={ORDER_FILTERS}
            values={filterValues}
            onChange={handleFilterChange}
            onApply={() => {
              setCurrentPage(1);
              setCursors([null]);
            }}
            onReset={() => {
              setFilterValues({
                status: "",
                sortBy: "created_at",
                sortOrder: "desc",
              });
              setCurrentPage(1);
              setCursors([null]);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            resultCount={totalOrders}
            isLoading={loading}
          />

          <div className="flex-1 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold">{totalOrders}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === "pending").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Processing</div>
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter((o) => o.status === "processing").length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm text-gray-600">Delivered</div>
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "delivered").length}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No orders found
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Total
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
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div>{order.customerName}</div>
                          <div className="text-gray-500">
                            {order.customerEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "processing"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          {order.status === "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "processing")
                              }
                              className="text-blue-600 hover:text-blue-900"
                              title="Start Processing"
                            >
                              <Package className="w-5 h-5" />
                            </button>
                          )}
                          {order.status === "processing" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(order.id, "shipped")
                              }
                              className="text-purple-600 hover:text-purple-900"
                              title="Mark as Shipped"
                            >
                              <Truck className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              router.push(`/seller/orders/${order.id}`)
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

            {orders.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} • {orders.length} orders
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
