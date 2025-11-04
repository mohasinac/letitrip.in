"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Package,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Order } from "@/types/order";
import { getOrderStatusInfo } from "@/lib/order/order-utils";
import { useCurrency } from "@/contexts/CurrencyContext";
import toast from "react-hot-toast";

export default function TrackOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Auto-populate email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else if (user?.phone) {
      // If no email, use phone number
      setEmail(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(
          orderNumber
        )}&email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        throw new Error("Failed to track order");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error: any) {
      console.error("Error tracking order:", error);
      toast.error(error.message || "Failed to track order");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? getOrderStatusInfo(order.status) : null;

  // Order timeline stages
  const orderStages = [
    { key: "pending", label: "Order Placed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const getCurrentStageIndex = (status: string) => {
    const stageMap: { [key: string]: number } = {
      pending: 0,
      confirmed: 1,
      processing: 1,
      shipped: 2,
      "out-for-delivery": 3,
      delivered: 4,
      cancelled: -1,
      refunded: -1,
    };
    return stageMap[status] ?? 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {user && (
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4 no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user
              ? "Enter your order number to track your order"
              : "Enter your order number and email to track your order"}
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6"
        >
          <div className="mb-6">
            <label
              htmlFor="orderNumber"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ORD-123456"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address or Phone Number{" "}
              {user && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  (Auto-filled)
                </span>
              )}
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                user
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                  : "bg-white dark:bg-gray-700"
              } text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder={
                user
                  ? email || "your.email@example.com"
                  : "your.email@example.com or phone number"
              }
              required
            />
            {user ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Using your account {user.email ? "email" : "phone number"}. You
                can change this if needed.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the email or phone number used when placing the order.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Track Order
              </>
            )}
          </button>
        </form>

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Order Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We couldn't find an order with that order number and email. Please
              check your details and try again.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && statusInfo && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color.replace(
                    "text-",
                    "bg-"
                  )}/10 ${statusInfo.color}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${statusInfo.color.replace(
                      "text-",
                      "bg-"
                    )}`}
                  />
                  {statusInfo.label}
                </span>
              </div>

              {/* Timeline */}
              {!["cancelled", "refunded"].includes(order.status) && (
                <div className="relative pt-6">
                  <div className="flex items-center justify-between">
                    {orderStages.map((stage, index) => {
                      const currentIndex = getCurrentStageIndex(order.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div
                          key={stage.key}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            } ${
                              isCurrent
                                ? "ring-4 ring-green-200 dark:ring-green-900"
                                : ""
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-400" />
                            )}
                          </div>
                          <p
                            className={`mt-2 text-xs font-medium text-center ${
                              isCompleted
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {stage.label}
                          </p>
                          {index < orderStages.length - 1 && (
                            <div
                              className={`absolute top-5 left-[${
                                (index + 0.5) * 25
                              }%] w-[25%] h-0.5 -translate-x-1/2 ${
                                index < currentIndex
                                  ? "bg-green-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                              style={{
                                left: `${
                                  ((index + 1) / orderStages.length) * 100
                                }%`,
                                width: `${(1 / orderStages.length) * 100}%`,
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Details
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p>Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                      {/* Add image if available */}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium no-underline"
              >
                View Full Details
              </Link>
              <Link
                href="/contact"
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium no-underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
