"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService, type OrderFilters } from "@/services/orders.service";
import { shopsService } from "@/services/shops.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UnifiedFilterSidebar } from "@/components/common/inline-edit";
import { ORDER_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import type { Order, OrderStatus, PaymentStatus, Shop } from "@/types";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters - unified state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 20;

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, searchQuery, filterValues, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: OrderFilters = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        ...filterValues,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const [ordersData, shopsData, statsData] = await Promise.all([
        ordersService.list(filters),
        shopsService.list({ limit: 1000 }),
        ordersService.getStats().catch(() => null),
      ]);

      setOrders(ordersData.data || []);
      setTotalPages(ordersData.pagination?.totalPages || 1);
      setTotalOrders(ordersData.pagination?.total || 0);
      setShops(shopsData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

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
      order.shippingAddress.name,
      new Date(order.createdAt).toLocaleDateString(),
      order.items.length,
      `₹${order.total.toFixed(2)}`,
      order.status,
      order.paymentStatus,
      order.paymentMethod,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
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
      pending: "bg-yellow-100 text-yellow-700",
      paid: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
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
        <div className="grid gap-6 md:grid-cols-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders || 0}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.averageOrderValue || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingOrders || 0}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by order number, customer name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        {isMobile && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        )}
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters - Always Visible Sidebar */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={ORDER_FILTERS}
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
            mobile={false}
            resultCount={totalOrders}
            isLoading={loading}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Orders Table */}
          <div className="rounded-lg border border-gray-200 bg-white">
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
                            {order.paymentMethod.toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {order.shippingAddress.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingAddress.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          ₹{order.total.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(
                            order.paymentStatus
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
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, totalOrders)}
                    </span>{" "}
                    of <span className="font-medium">{totalOrders}</span>{" "}
                    results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
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
          onChange={(key, value) => {
            setFilterValues((prev) => ({
              ...prev,
              [key]: value,
            }));
          }}
          onApply={() => {
            setShowFilters(false);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFilterValues({});
            setCurrentPage(1);
          }}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          searchable={true}
          mobile={true}
          resultCount={totalOrders}
          isLoading={loading}
        />
      )}
    </div>
  );
}
