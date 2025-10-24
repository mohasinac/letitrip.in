"use client";

import { useState, useEffect } from "react";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import { Order, OrderStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  EyeIcon,
  CheckIcon,
  TruckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const sellerId = "current-seller-id"; // Get from auth context
      const response = await fetch(
        `/api/seller/orders?sellerId=${sellerId}&filter=${filter}`
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      } else {
        console.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return badges[status];
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <UnifiedLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Orders Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View and process your customer orders
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: "all", label: "All Orders" },
              { key: "pending", label: "Pending" },
              { key: "confirmed", label: "Confirmed" },
              { key: "processing", label: "Processing" },
              { key: "shipped", label: "Shipped" },
              { key: "delivered", label: "Delivered" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id}>
                  <div className="px-4 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {order.orderNumber}
                            </h3>
                            <span
                              className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()} •{" "}
                            {order.items.length} item(s) • ₹
                            {order.total.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Ship to: {order.shippingAddress.name},{" "}
                            {order.shippingAddress.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.status === "pending" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-700 p-2 rounded-md hover:bg-green-50"
                            title="Confirm Order"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                        )}
                        {order.status === "confirmed" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "processing")
                            }
                            className="text-blue-600 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50"
                            title="Mark as Processing"
                          >
                            <TruckIcon className="h-5 w-5" />
                          </button>
                        )}
                        {(order.status === "pending" ||
                          order.status === "confirmed") && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "cancelled")
                            }
                            className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                            title="Cancel Order"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-700 p-2 rounded-md hover:bg-gray-50">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg"
                          >
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
}
