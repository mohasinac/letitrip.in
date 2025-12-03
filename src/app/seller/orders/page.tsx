"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { StatsCardGrid, StatsCard } from "@/components/common/StatsCard";
import { ORDER_FILTERS } from "@/constants/filters";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE, OrderFiltersFE } from "@/types/frontend/order.types";
import { OrderStatus } from "@/types/shared/common.types";
import { logComponentError } from "@/lib/error-logger";
import {
  Eye,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";
import { useLoadingState } from "@/hooks/useLoadingState";

export default function SellerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");

  const [orders, setOrders] = useState<OrderCardFE[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

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
    const newUrl = queryString
      ? `?${queryString}`
      : globalThis.location?.pathname || "";
    globalThis.history?.replaceState({}, "", newUrl);
  }, [filterValues]);

  useEffect(() => {
    loadOrders();
  }, [filterValues, currentPage]);

  const loadOrders = useCallback(async () => {
    await execute(async () => {
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
    });
  }, [filterValues, currentPage, cursors, execute]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      globalThis.scrollTo?.({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (
    key: string,
    value: string | number | boolean | undefined,
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
        error as Error,
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
              sections={ORDER_FILTERS}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={() => {
                setCurrentPage(1);
                setCursors([null]);
                if (isMobile) setShowFilters(false);
              }}
              onReset={() => {
                setFilterValues({
                  status: undefined,
                  sortBy: "createdAt",
                  sortOrder: "desc",
                });
                setSearchQuery("");
                setCurrentPage(1);
                setCursors([null]);
              }}
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              searchable={true}
              mobile={isMobile}
              resultCount={totalOrders}
              isLoading={isLoading}
              showInlineSearch={true}
              inlineSearchValue={searchQuery}
              onInlineSearchChange={setSearchQuery}
              inlineSearchPlaceholder="Search orders..."
            />

            <div className="flex-1 p-4 sm:p-6">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                My Orders
              </h1>

              <StatsCardGrid columns={4} className="mb-6">
                <StatsCard title="Total Orders" value={totalOrders} />
                <StatsCard
                  title="Pending"
                  value={
                    orders.filter((o) => o.status === OrderStatus.PENDING)
                      .length
                  }
                  className="[&_p:last-child]:!text-yellow-600 dark:[&_p:last-child]:!text-yellow-400"
                />
                <StatsCard
                  title="Processing"
                  value={
                    orders.filter((o) => o.status === OrderStatus.PROCESSING)
                      .length
                  }
                  className="[&_p:last-child]:!text-blue-600 dark:[&_p:last-child]:!text-blue-400"
                />
                <StatsCard
                  title="Delivered"
                  value={
                    orders.filter((o) => o.status === OrderStatus.DELIVERED)
                      .length
                  }
                  className="[&_p:last-child]:!text-green-600 dark:[&_p:last-child]:!text-green-400"
                />
              </StatsCardGrid>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {error ? (
                  <div className="p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">
                      {error.message}
                    </p>
                    <button
                      onClick={loadOrders}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No orders found
                  </div>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    {isMobile && (
                      <div className="lg:hidden space-y-4 p-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white dark:bg-gray-800 rounded-lg border p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-mono text-sm text-gray-900 dark:text-white">
                                  #{order.id.substring(0, 8)}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {order.shippingAddress?.name || "N/A"}
                                </p>
                              </div>
                              <span
                                className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
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
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Total:
                                </span>
                                <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(order.total)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Items:
                                </span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {order.itemCount}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Date:
                                </span>
                                <span className="ml-1 text-gray-900 dark:text-white">
                                  {order.orderDate}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
                              {order.status === OrderStatus.PENDING && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      order.id,
                                      OrderStatus.PROCESSING,
                                    )
                                  }
                                  className="flex-1 py-2 text-center text-blue-600 font-medium border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center justify-center gap-1"
                                >
                                  <Package className="w-4 h-4" />
                                  Process
                                </button>
                              )}
                              {order.status === OrderStatus.PROCESSING && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      order.id,
                                      OrderStatus.SHIPPED,
                                    )
                                  }
                                  className="flex-1 py-2 text-center text-purple-600 font-medium border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm flex items-center justify-center gap-1"
                                >
                                  <Truck className="w-4 h-4" />
                                  Ship
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  router.push(`/seller/orders/${order.id}`)
                                }
                                className="flex-1 py-2 text-center text-indigo-600 font-medium border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors text-sm flex items-center justify-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                            </div>
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
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Total
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
                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 text-sm font-mono dark:text-white">
                                {order.id}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="dark:text-white">
                                  {order.shippingAddress?.name || "N/A"}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                  {order.shippingAddress?.phone || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm dark:text-gray-300">
                                {order.itemCount} items
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold dark:text-white">
                                {formatCurrency(order.total)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    order.status === OrderStatus.DELIVERED
                                      ? "bg-green-100 text-green-800"
                                      : order.status === OrderStatus.SHIPPED
                                        ? "bg-blue-100 text-blue-800"
                                        : order.status ===
                                            OrderStatus.PROCESSING
                                          ? "bg-purple-100 text-purple-800"
                                          : order.status ===
                                              OrderStatus.CANCELLED
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {order.orderDate}
                              </td>
                              <td className="px-6 py-4 text-sm space-x-2">
                                {order.status === OrderStatus.PENDING && (
                                  <button
                                    onClick={() =>
                                      handleUpdateStatus(
                                        order.id,
                                        OrderStatus.PROCESSING,
                                      )
                                    }
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
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
                                        OrderStatus.SHIPPED,
                                      )
                                    }
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                                    title="Mark as Shipped"
                                  >
                                    <Truck className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    router.push(`/seller/orders/${order.id}`)
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

              {/* Pagination - Mobile Optimized */}
              {orders.length > 0 && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || isLoading}
                      className="flex items-center gap-2 px-4 py-3 min-h-[48px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-gray-700 dark:text-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Page {currentPage}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={!hasNextPage || isLoading}
                      className="flex items-center gap-2 px-4 py-3 min-h-[48px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-gray-700 dark:text-gray-300"
                    >
                      <span className="hidden sm:inline">Next</span>
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
