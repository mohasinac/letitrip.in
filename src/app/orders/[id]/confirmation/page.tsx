"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Loader2,
  Home,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types/order";
import { getOrderStatusInfo } from "@/lib/order/order-utils";
import toast from "react-hot-toast";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, authLoading, orderId]);

  const fetchOrder = async () => {
    try {
      if (!user || !user.getIdToken) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast.error(error.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Thank you for your order
          </p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${statusInfo.color.replace(
                  "text-",
                  "bg-"
                )}`}
              />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Order Status
                </p>
                <p className={`font-semibold ${statusInfo.color}`}>
                  {statusInfo.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment Status
              </p>
              <p
                className={`font-semibold ${
                  order.paymentStatus === "paid"
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div className="w-20 h-20 relative bg-gray-100 dark:bg-gray-700 rounded">
                  <Image
                    src={item.image || "/assets/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity: {item.quantity}
                  </p>
                  {item.sku && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPrice(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h2>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-white">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.pincode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment & Price Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Payment Method</span>
              <span className="font-medium text-gray-900 dark:text-white uppercase">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>
                {order.shippingCharges === 0
                  ? "FREE"
                  : formatPrice(order.shippingCharges)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (GST)</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors no-underline"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
          <Link
            href="/profile/orders"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors no-underline"
          >
            <FileText className="w-5 h-5" />
            View All Orders
          </Link>
          <Link
            href={`/orders/${orderId}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            <Package className="w-5 h-5" />
            Track Order
          </Link>
        </div>

        {/* Email Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
            📧 A confirmation email has been sent to {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
