"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        status: "delivered",
        paymentStatus: "paid",
        total: 109.97,
        items: [
          {
            id: "1",
            name: "Beyblade Burst Pro Series - Dragon Storm",
            quantity: 2,
            price: 29.99,
            image: "/images/beyblade-1.jpg",
          },
          {
            id: "2",
            name: "Beyblade Stadium - Thunder Dome",
            quantity: 1,
            price: 49.99,
            image: "/images/stadium-1.jpg",
          },
        ],
        createdAt: "2024-01-20T10:30:00Z",
        updatedAt: "2024-01-22T16:45:00Z",
        shippingAddress: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "USA",
        },
        trackingNumber: "1Z999AA1234567890",
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        status: "shipped",
        paymentStatus: "paid",
        total: 24.99,
        items: [
          {
            id: "3",
            name: "Metal Fight Beyblade - Lightning L-Drago",
            quantity: 1,
            price: 24.99,
            image: "/images/beyblade-2.jpg",
          },
        ],
        createdAt: "2024-01-18T16:15:00Z",
        updatedAt: "2024-01-19T09:30:00Z",
        shippingAddress: {
          street: "456 Oak Ave",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        trackingNumber: "1Z999AA1234567891",
      },
      {
        id: "3",
        orderNumber: "ORD-2024-003",
        status: "processing",
        paymentStatus: "paid",
        total: 89.98,
        items: [
          {
            id: "4",
            name: "Beyblade X - Xcalibur Sword",
            quantity: 2,
            price: 34.99,
            image: "/images/beyblade-3.jpg",
          },
          {
            id: "5",
            name: "Launcher Set - Power Grip Pro",
            quantity: 1,
            price: 19.99,
            image: "/images/launcher-1.jpg",
          },
        ],
        createdAt: "2024-01-15T14:22:00Z",
        updatedAt: "2024-01-16T11:15:00Z",
        shippingAddress: {
          street: "789 Pine St",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "USA",
        },
      },
      {
        id: "4",
        orderNumber: "ORD-2024-004",
        status: "pending",
        paymentStatus: "pending",
        total: 49.99,
        items: [
          {
            id: "6",
            name: "Beyblade Stadium - Battle Arena",
            quantity: 1,
            price: 49.99,
            image: "/images/stadium-2.jpg",
          },
        ],
        createdAt: "2024-01-12T08:45:00Z",
        updatedAt: "2024-01-12T08:45:00Z",
        shippingAddress: {
          street: "321 Elm St",
          city: "Miami",
          state: "FL",
          zipCode: "33101",
          country: "USA",
        },
      },
      {
        id: "5",
        orderNumber: "ORD-2024-005",
        status: "cancelled",
        paymentStatus: "refunded",
        total: 74.98,
        items: [
          {
            id: "7",
            name: "Beyblade Burst Launcher Set",
            quantity: 2,
            price: 29.99,
            image: "/images/launcher-2.jpg",
          },
          {
            id: "8",
            name: "Beyblade Parts Kit",
            quantity: 1,
            price: 14.99,
            image: "/images/parts-1.jpg",
          },
        ],
        createdAt: "2024-01-10T12:30:00Z",
        updatedAt: "2024-01-11T14:20:00Z",
        shippingAddress: {
          street: "654 Maple Ave",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "USA",
        },
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
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

  const canReorder = (order: Order) => {
    return order.status === "delivered" || order.status === "cancelled";
  };

  const canTrack = (order: Order) => {
    return (
      (order.status === "shipped" || order.status === "delivered") &&
      order.trackingNumber
    );
  };

  const canCancel = (order: Order) => {
    return order.status === "pending" || order.status === "processing";
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage your orders
                </p>
              </div>
              <Link href="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <input
                  type="text"
                  placeholder="Order number or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input w-full"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Orders" : status.toUpperCase()}
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
                    setCurrentPage(1);
                  }}
                  className="btn btn-outline w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {paginatedOrders.length > 0 ? (
            <div className="space-y-6">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="h-16 w-16 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × $
                              {item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Shipping Address
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state}{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                          </div>
                        </div>
                        {order.trackingNumber && (
                          <div className="text-right">
                            <h4 className="font-medium text-gray-900">
                              Tracking Number
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </Link>
                        {canTrack(order) && (
                          <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                            Track Order
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <Link
                            href={`/orders/${order.id}/invoice`}
                            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Download Invoice
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        {canReorder(order) && (
                          <button className="btn btn-outline btn-sm">
                            Reorder
                          </button>
                        )}
                        {canCancel(order) && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to cancel this order? This action cannot be undone."
                                )
                              ) {
                                // Handle cancel order
                                console.log("Cancel order:", order.id);
                              }
                            }}
                            className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <Link
                            href={`/orders/${order.id}/review`}
                            className="btn btn-primary btn-sm"
                          >
                            Write Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your filters to find what you're looking for."
                  : "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              <div className="mt-6">
                <Link href="/products" className="btn btn-primary">
                  Start Shopping
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        page === currentPage
                          ? "bg-primary text-white"
                          : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
