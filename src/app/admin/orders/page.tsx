"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Filter,
  Eye,
  Download,
  Loader2,
  AlertCircle,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";
import type { OrderCardFE } from "@/types/frontend/order.types";
import type { OrderFiltersBE } from "@/types/backend/order.types";
import { OrderStatus, PaymentStatus } from "@/types/shared/common.types";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { Price } from "@/components/common/values";
import { ORDER_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderCardFE[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cursor pagination state
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 20;

  // Filters - unified state
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [filterValues, setFilterValues] = useState<Partial<OrderFiltersBE>>({
    status: (searchParams.get("status") as any) || undefined,
  });

  // Infinite loop prevention
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (filterValues.status) {
      const status = Array.isArray(filterValues.status)
        ? filterValues.status[0]
        : filterValues.status;
      params.set("status", status);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `?${queryString}`
      : globalThis.location?.pathname || "";
    globalThis.history?.replaceState({}, "", newUrl);
  }, [searchQuery, filterValues]);

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

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
    setCursors([null]);
  };

  const loadData = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const startAfter = cursors[currentPage - 1];
      const filters: any = {
        startAfter,
        limit,
        search: debouncedSearchQuery || undefined,
        ...filterValues,
      };

      const [ordersData, statsData] = await Promise.all([
        ordersService.list(filters),
        ordersService.getStats().catch(() => null),
      ]);

      setOrders(ordersData.data || []);
      setTotalOrders(ordersData.count || 0);

      // Check if it's cursor pagination
      if ("hasNextPage" in ordersData.pagination) {
        setHasNextPage(ordersData.pagination.hasNextPage || false);

        // Store next cursor
        if ("nextCursor" in ordersData.pagination) {
          const cursorPagination = ordersData.pagination as any;
          if (cursorPagination.nextCursor) {
            setCursors((prev) => {
              const newCursors = [...prev];
              newCursors[currentPage] = cursorPagination.nextCursor || null;
              return newCursors;
            });
          }
        }
      }

      setStats(statsData);

      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load orders",
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentPage, debouncedSearchQuery, filterValues, cursors, limit]);

  useEffect(() => {
    if (user?.uid && isAdmin && !loadingRef.current) {
      loadData();
    }
  }, [user?.uid, isAdmin, loadData]);

  const handleBulkExport = () => {
    const headers = [
      "Order Number",
      "Customer",
      "Date",
      "Items",
      "Total",
      "Status",
      "Payment Status",
      "Payment Method",
    ];

    const rows = orders.map((order) => [
      order.orderNumber,
      order.shippingAddress?.name || "N/A",
      order.createdAt || order.orderDate,
      order.itemCount,
      `₹${order.total.toFixed(2)}`,
      order.status,
      order.paymentStatus,
      order.paymentMethod || "N/A",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-purple-100 text-purple-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors: Record<PaymentStatus, string> = {
      [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-700",
      [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-700",
      [PaymentStatus.COMPLETED]: "bg-green-100 text-green-700",
      [PaymentStatus.FAILED]: "bg-red-100 text-red-700",
      [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all orders on the platform ({totalOrders} total)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <StatsCardGrid columns={4}>
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders || 0}
            icon={<ShoppingCart className="w-5 h-5 text-purple-600" />}
            className="[&>div:first-child]:bg-purple-100 dark:[&>div:first-child]:bg-purple-900/30"
          />
          <StatsCard
            title="Total Revenue"
            value={<Price amount={stats.totalRevenue || 0} />}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            className="[&>div:first-child]:bg-green-100 dark:[&>div:first-child]:bg-green-900/30"
          />
          <StatsCard
            title="Avg Order Value"
            value={<Price amount={stats.averageOrderValue || 0} />}
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            className="[&>div:first-child]:bg-blue-100 dark:[&>div:first-child]:bg-blue-900/30"
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders || 0}
            icon={<Package className="w-5 h-5 text-orange-600" />}
            className="[&>div:first-child]:bg-yellow-100 dark:[&>div:first-child]:bg-yellow-900/30"
          />
        </StatsCardGrid>
      )}

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters - Always Visible Sidebar */}
        {!isMobile && (
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
              });
              setSearchQuery("");
              setCurrentPage(1);
              setCursors([null]);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={totalOrders}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search by order number, customer..."
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Mobile Cards */}
          {isMobile && orders.length > 0 && (
            <div className="lg:hidden space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.shippingAddress?.name || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status,
                      )}`}
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
                        <Price amount={order.total} />
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
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="ml-1 text-gray-900 dark:text-white">
                        {order.createdAt || order.orderDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Payment:
                      </span>
                      <span
                        className={`ml-1 px-1.5 py-0.5 text-xs font-medium rounded ${getPaymentStatusColor(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="block w-full py-2 text-center text-purple-600 font-medium border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Desktop Orders Table */}
          <div
            className={`rounded-lg border border-gray-200 bg-white ${
              isMobile ? "hidden" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.paymentMethod?.toUpperCase() || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.shippingAddress?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress?.phone || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.createdAt || order.orderDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.itemCount} item
                        {order.itemCount !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          <Price amount={order.total} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(
                            order.paymentStatus,
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded p-1.5 text-purple-600 hover:bg-purple-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.length > 0 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} • {orders.length} orders
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {orders.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "No orders found"
                  : "No orders yet"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "Try adjusting your filters"
                  : "Orders will appear here as customers make purchases"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobile && (
        <UnifiedFilterSidebar
          sections={ORDER_FILTERS}
          values={filterValues}
          onChange={handleFilterChange}
          onApply={() => {
            setShowFilters(false);
            setCurrentPage(1);
            setCursors([null]);
          }}
          onReset={() => {
            setFilterValues({
              status: undefined,
            });
            setSearchQuery("");
            setCurrentPage(1);
            setCursors([null]);
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalOrders}
          isLoading={loading}
          showInlineSearch={true}
          onInlineSearchChange={(value: string) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          inlineSearchValue={searchQuery}
          inlineSearchPlaceholder="Search by order number, customer..."
        />
      )}
    </div>
  );
}
