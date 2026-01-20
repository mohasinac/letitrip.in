"use client";

import React, { useState } from "react";

/**
 * OrdersDatatable Component
 *
 * A comprehensive data table for viewing and managing seller orders with:
 * - View-only mode (no bulk delete, immutable order data)
 * - Shop-filtered orders (only shows orders for seller's shop)
 * - Advanced filtering by status, date range, and customer
 * - Order status updates and tracking
 * - Invoice download functionality
 * - Grid/Table toggle for different viewing preferences
 *
 * @example
 * ```tsx
 * <OrdersDatatable
 *   orders={orders}
 *   onStatusUpdate={(id, status) => console.log('Status update:', id, status)}
 *   onDownloadInvoice={(id) => console.log('Download:', id)}
 * />
 * ```
 */

// Types
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

interface OrdersDatatableProps {
  orders: Order[];
  onStatusUpdate?: (orderId: string, newStatus: Order["status"]) => void;
  onDownloadInvoice?: (orderId: string) => void;
  shopName?: string;
}

// Mock data for development
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-001",
    customerName: "Rajesh Kumar",
    customerEmail: "rajesh.kumar@example.com",
    items: 3,
    total: 12500,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: new Date("2026-01-10T14:30:00"),
    updatedAt: new Date("2026-01-18T10:15:00"),
  },
  {
    id: "2",
    orderNumber: "ORD-2026-002",
    customerName: "Priya Sharma",
    customerEmail: "priya.sharma@example.com",
    items: 1,
    total: 2999,
    paymentMethod: "Card",
    paymentStatus: "paid",
    status: "shipped",
    createdAt: new Date("2026-01-15T09:20:00"),
    updatedAt: new Date("2026-01-19T16:45:00"),
  },
  {
    id: "3",
    orderNumber: "ORD-2026-003",
    customerName: "Amit Patel",
    customerEmail: "amit.patel@example.com",
    items: 5,
    total: 8750,
    paymentMethod: "COD",
    paymentStatus: "pending",
    status: "processing",
    createdAt: new Date("2026-01-18T11:00:00"),
    updatedAt: new Date("2026-01-19T14:20:00"),
  },
  {
    id: "4",
    orderNumber: "ORD-2026-004",
    customerName: "Sneha Reddy",
    customerEmail: "sneha.reddy@example.com",
    items: 2,
    total: 4599,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: new Date("2026-01-19T16:45:00"),
    updatedAt: new Date("2026-01-20T08:30:00"),
  },
  {
    id: "5",
    orderNumber: "ORD-2026-005",
    customerName: "Vikram Singh",
    customerEmail: "vikram.singh@example.com",
    items: 1,
    total: 1299,
    paymentMethod: "Card",
    paymentStatus: "failed",
    status: "cancelled",
    createdAt: new Date("2026-01-20T10:15:00"),
    updatedAt: new Date("2026-01-20T10:20:00"),
  },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "date_desc" },
  { label: "Oldest First", value: "date_asc" },
  { label: "Amount (High to Low)", value: "amount_desc" },
  { label: "Amount (Low to High)", value: "amount_asc" },
  { label: "Order Number (A-Z)", value: "order_asc" },
  { label: "Order Number (Z-A)", value: "order_desc" },
  { label: "Customer (A-Z)", value: "customer_asc" },
  { label: "Customer (Z-A)", value: "customer_desc" },
];

const STATUS_OPTIONS: Order["status"][] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersDatatable({
  orders: initialOrders = MOCK_ORDERS,
  onStatusUpdate,
  onDownloadInvoice,
  shopName = "My Shop",
}: OrdersDatatableProps) {
  // State management
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Handle status update
  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order,
    );
    setOrders(updatedOrders);

    // Call parent callback
    if (onStatusUpdate) {
      onStatusUpdate(orderId, newStatus);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = (orderId: string) => {
    console.log("Downloading invoice for order:", orderId);

    // Call parent callback
    if (onDownloadInvoice) {
      onDownloadInvoice(orderId);
    }
  };

  // Handle search (triggered on Enter key)
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      console.log("Search:", searchQuery);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Search filter (order number, customer name, email)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((order) => {
      // Status filter
      if (statusFilter === "all") return true;
      return order.status === statusFilter;
    })
    .filter((order) => {
      // Payment status filter
      if (paymentStatusFilter === "all") return true;
      return order.paymentStatus === paymentStatusFilter;
    })
    .filter((order) => {
      // Date range filter
      if (dateFrom && new Date(dateFrom) > order.createdAt) return false;
      if (dateTo && new Date(dateTo) < order.createdAt) return false;
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      switch (sortBy) {
        case "date_asc":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "date_desc":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "amount_asc":
          return a.total - b.total;
        case "amount_desc":
          return b.total - a.total;
        case "order_asc":
          return a.orderNumber.localeCompare(b.orderNumber);
        case "order_desc":
          return b.orderNumber.localeCompare(a.orderNumber);
        case "customer_asc":
          return a.customerName.localeCompare(b.customerName);
        case "customer_desc":
          return b.customerName.localeCompare(a.customerName);
        default:
          return 0;
      }
    });

  // Get status badge color
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
      case "confirmed":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      case "processing":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "shipped":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400";
      case "delivered":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
    }
  };

  // Get payment status badge color
  const getPaymentStatusColor = (paymentStatus: Order["paymentStatus"]) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
    }
  };

  // Calculate total revenue
  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + (order.paymentStatus === "paid" ? order.total : 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Orders
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredOrders.length} order(s) • Total Revenue: ₹
            {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            Showing orders for: {shopName}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          {/* Row 1: Search and Status filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search orders
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by order number, customer name, or email (press Enter)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Order Status Filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by order status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label htmlFor="payment-status-filter" className="sr-only">
                Filter by payment status
              </label>
              <select
                id="payment-status-filter"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date range, Sort, and View toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date From */}
            <div>
              <label htmlFor="date-from" className="sr-only">
                From date
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="From date"
              />
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="date-to" className="sr-only">
                To date
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="To date"
              />
            </div>

            {/* Sort */}
            <div className="flex-1">
              <label htmlFor="sort" className="sr-only">
                Sort by
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg border ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                } transition-colors`}
                title="Table View"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                } transition-colors`}
                title="Grid View"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{order.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            order.id,
                            e.target.value as Order["status"],
                          )
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => console.log("View details:", order.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="View Details"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Download Invoice"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {order.createdAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order.customerEmail}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items} {order.items === 1 ? "item" : "items"}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{order.total.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    via {order.paymentMethod}
                  </span>
                </div>

                {/* Status Update */}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                    Order Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        order.id,
                        e.target.value as Order["status"],
                      )
                    }
                    className={`w-full px-3 py-2 text-sm font-semibold rounded-lg border-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <button
                  onClick={() => console.log("View details:", order.id)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDownloadInvoice(order.id)}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Download Invoice"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="col-span-full text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
