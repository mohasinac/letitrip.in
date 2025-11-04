"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Package,
  Loader2,
  ShoppingBag,
  ChevronRight,
  Calendar,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types/order";
import { getOrderStatusInfo } from "@/lib/order/order-utils";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function UserOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "delivered" | "cancelled"
  >("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile/orders");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      if (!user) return;

      const ordersData = await api.orders.getOrders();
      setOrders((ordersData.orders as any) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active")
      return !["delivered", "cancelled", "refunded"].includes(order.status);
    if (filter === "delivered") return order.status === "delivered";
    if (filter === "cancelled")
      return ["cancelled", "refunded"].includes(order.status);
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your orders
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All Orders" },
            { value: "active", label: "Active" },
            { value: "delivered", label: "Delivered" },
            { value: "cancelled", label: "Cancelled" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {filter === "all"
                ? "Start shopping to create your first order"
                : `You don't have any ${filter} orders`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatusInfo(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow no-underline"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Order #{order.orderNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color.replace(
                            "text-",
                            "bg-"
                          )}/10 ${statusInfo.color}`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${statusInfo.color.replace(
                              "text-",
                              "bg-"
                            )}`}
                          />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {order.paymentMethod.toUpperCase()}
                        </span>
                        <span
                          className={`font-medium ${
                            order.paymentStatus === "paid"
                              ? "text-green-600 dark:text-green-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        >
                          {order.paymentStatus === "paid"
                            ? "Paid"
                            : "Payment Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 4).map((item, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 flex-shrink-0 relative bg-gray-100 dark:bg-gray-700 rounded"
                      >
                        <Image
                          src={item.image || "/assets/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          +{order.items.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shipping Info */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.shippingAddress.fullName}
                        </p>
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
