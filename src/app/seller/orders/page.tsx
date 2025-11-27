"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { ORDER_FILTERS } from "@/constants/filters";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE, OrderFiltersFE } from "@/types/frontend/order.types";
import { OrderStatus } from "@/types/shared/common.types";
import { logComponentError } from "@/lib/error-logger";
import { Eye, Package, Truck, ChevronLeft, ChevronRight } from "lucide-react";

export default function SellerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [orders, setOrders] = useState<OrderCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  // Filters from URL
  const [filterValues, setFilterValues] = useState<Partial<OrderFiltersFE>>({
    status: searchParams.get("status")
      ? [searchParams.get("status") as OrderStatus]
      : undefined,
    sortBy:
      (searchParams.get("sortBy") as OrderFiltersFE["sortBy"]) || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterValues.status && filterValues.status.length > 0) {
      params.set("status", filterValues.status[0]);
    }
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
        limit: 20,
      } as any);

      setOrders(response.data || []);
      setTotalOrders(response.count || 0);

      // Check if it's cursor pagination
      if (response.pagination && "hasNextPage" in response.pagination) {
        setHasNextPage(response.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in response.pagination) {
          const nextCursor = response.pagination.nextCursor;
          if (nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = nextCursor;
              return newCursors;
            });
          }
        }
      }
    } catch (error) {
      logComponentError("SellerOrdersPage", "loadOrders", error as Error);
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

  const handleFilterChange = (
    key: string,
    value: string | number | boolean | undefined
  ) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(id, status);
      loadOrders();
    } catch (error) {
      logComponentError(
        "SellerOrdersPage",
        "handleUpdateStatus",
        error as Error
      );
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
      <ErrorBoundary>
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
                  status: undefined,
                  sortBy: "createdAt",
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
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                My Orders
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Total Orders</div>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      orders.filter((o) => o.status === OrderStatus.PENDING)
                        .length
                    }
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Processing</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      orders.filter((o) => o.status === OrderStatus.PROCESSING)
                        .length
                    }
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="text-sm text-gray-600">Delivered</div>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      orders.filter((o) => o.status === OrderStatus.DELIVERED)
                        .length
                    }
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
                            <div>{order.shippingAddress?.name || "N/A"}</div>
                            <div className="text-gray-500">
                              {order.shippingAddress?.phone || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {order.itemCount} items
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === OrderStatus.DELIVERED
                                  ? "bg-green-100 text-green-800"
                                  : order.status === OrderStatus.SHIPPED
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === OrderStatus.PROCESSING
                                  ? "bg-purple-100 text-purple-800"
                                  : order.status === OrderStatus.CANCELLED
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {order.orderDate}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            {order.status === OrderStatus.PENDING && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    OrderStatus.PROCESSING
                                  )
                                }
                                className="text-blue-600 hover:text-blue-900"
                                title="Start Processing"
                              >
                                <Package className="w-5 h-5" />
                              </button>
                            )}
                            {order.status === OrderStatus.PROCESSING && (
                              <button
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    OrderStatus.SHIPPED
                                  )
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
      </ErrorBoundary>
    </AuthGuard>
  );
}
