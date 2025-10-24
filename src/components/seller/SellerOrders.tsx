"use client";

import { useState, useEffect } from "react";
import { Order } from "@/types";

interface SellerOrdersData {
  orders: Order[];
  loading: boolean;
}

export default function SellerOrders() {
  const [data, setData] = useState<SellerOrdersData>({
    orders: [],
    loading: true,
  });

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch("/api/seller/orders?limit=8&sort=newest");
        if (response.ok) {
          const orders = await response.json();
          setData({ orders, loading: false });
        } else {
          setData({ orders: [], loading: false });
          console.error("Failed to fetch seller orders:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch seller orders:", error);
        setData({ orders: [], loading: false });
      }
    };

    fetchSellerOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - orderDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (data.loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All Orders
        </button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.orders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p>No orders found</p>
              <p className="text-sm text-gray-400 mt-1">
                Orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            data.orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </h4>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.shippingAddress.name} •{" "}
                      {order.shippingAddress.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getTimeAgo(order.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-700">{item.productName}</span>
                      <span className="text-gray-500">×{item.quantity}</span>
                      <span className="text-gray-900 font-medium ml-auto">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.status === "confirmed" && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md transition-colors">
                        Process Order
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm px-3 py-2 rounded-md transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
