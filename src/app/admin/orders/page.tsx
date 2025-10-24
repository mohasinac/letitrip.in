"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminService } from "@/lib/services/admin.service";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    id: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function AdminOrdersPage() {
  const { user } = useEnhancedAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Real-time orders data
  const {
    data: ordersData,
    loading,
    error,
    refresh,
    lastUpdated,
  } = useRealTimeData(AdminService.getOrders, {
    interval: 30000, // 30 seconds
    enabled: !!user,
  });

  const orders = (ordersData?.orders || []) as unknown as Order[];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;
    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      order.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const statuses = [
    "all",
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const paymentStatuses = ["all", "pending", "paid", "failed", "refunded"];

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await AdminService.updateOrderStatus(
        orderId,
        newStatus as Order["status"]
      );
      refresh(); // Refresh the data after update
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-primary">
                  Order Management
                </h1>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-sm text-muted">
                    {loading
                      ? "Updating..."
                      : `Updated ${
                          lastUpdated
                            ? new Date(lastUpdated).toLocaleTimeString()
                            : "now"
                        }`}
                  </span>
                </div>
              </div>
              <p className="text-secondary mt-1">
                Track and manage customer orders • {orders.length} total orders
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refresh}
                disabled={loading}
                className="btn btn-outline"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button className="btn btn-outline">Export Orders</button>
              <Link
                href="/admin/orders/bulk-update"
                className="btn btn-secondary"
              >
                Bulk Update
              </Link>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="admin-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Order number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full"
              />
            </div>

            {/* Order Status Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Order Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-full"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="input w-full"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all"
                      ? "All Payment Statuses"
                      : status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStatus("all");
                  setSelectedPaymentStatus("all");
                  setCurrentPage(1);
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="admin-card p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-secondary">Total Orders</p>
              <p className="text-2xl font-bold text-primary">
                {orders.length}
              </p>
            </div>
          </div>
          <div className="admin-card p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-secondary">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
            </div>
          </div>
          <div className="admin-card p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-secondary">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "processing").length}
              </p>
            </div>
          </div>
          <div className="admin-card p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-secondary">Shipped</p>
              <p className="text-2xl font-bold text-purple-600">
                {orders.filter((o) => o.status === "shipped").length}
              </p>
            </div>
          </div>
          <div className="admin-card p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-secondary">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover: bg-surface">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-muted">
                          ID: {order.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-primary">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-muted">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""}
                      </div>
                      <div className="text-sm text-muted">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value)
                        }
                        className="text-xs border-none bg-transparent focus:ring-0 focus:border-none"
                      >
                        {statuses
                          .filter((s) => s !== "all")
                          .map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                      </select>
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            // Handle print invoice
                            console.log("Print invoice for order:", order.id);
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-background px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-secondary bg-background hover: bg-surface disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-secondary bg-background hover: bg-surface disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-secondary">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredOrders.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredOrders.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-primary border-primary text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
