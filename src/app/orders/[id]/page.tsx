"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Package,
  Loader2,
  ChevronLeft,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Truck,
  FileText,
  MessageSquare,
  RotateCcw,
  X,
  AlertCircle,
  Download,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Order } from "@/types/order";
import { getOrderStatusInfo } from "@/lib/order/order-utils";
import toast from "react-hot-toast";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      setOrderId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile/orders");
      return;
    }

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, authLoading, orderId]);

  const fetchOrder = async () => {
    try {
      if (!user || !user.getIdToken || !orderId) return;

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
      toast.error(error.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !orderId) return;

    if (!confirm("Are you sure you want to cancel this order?")) return;

    setActionLoading(true);
    try {
      if (!user?.getIdToken) return;
      const token = await user.getIdToken();
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel order");
      }

      toast.success("Order cancelled successfully");
      fetchOrder();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast.error(error.message || "Failed to cancel order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      toast.success("Order number copied!");
    }
  };

  const handleDownloadInvoice = () => {
    if (orderId) {
      toast.loading("Generating invoice...");
      // Open in new tab
      window.open(`/api/orders/${orderId}/invoice`, "_blank");
      toast.dismiss();
      toast.success("Invoice opened in new tab");
    }
  };

  const handleTrackShipment = () => {
    toast("Tracking information coming soon!", { icon: "ℹ️" });
    // TODO: Implement tracking page
  };

  const handleContactSeller = () => {
    toast("Contact seller feature coming soon!", { icon: "ℹ️" });
    // TODO: Implement seller contact
  };

  const handleRequestReturn = () => {
    toast("Return request feature coming soon!", { icon: "ℹ️" });
    // TODO: Implement return request flow
  };

  if (authLoading || loading || !orderId) {
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
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);
  const canCancel = ["pending_approval", "approved", "processing"].includes(
    order.status
  );
  
  // Check if within 1-day cancellation window
  const canCancelWithinTimeLimit = (() => {
    if (!canCancel || !order.paidAt) return false;
    const paidAt = new Date(order.paidAt);
    const now = new Date();
    const hoursSincePayment = (now.getTime() - paidAt.getTime()) / (1000 * 60 * 60);
    return hoursSincePayment <= 24;
  })();

  const cancellationTimeRemaining = (() => {
    if (!order.paidAt) return null;
    const paidAt = new Date(order.paidAt);
    const now = new Date();
    const hoursRemaining = 24 - ((now.getTime() - paidAt.getTime()) / (1000 * 60 * 60));
    if (hoursRemaining <= 0) return null;
    if (hoursRemaining < 1) return `${Math.floor(hoursRemaining * 60)} minutes`;
    return `${Math.floor(hoursRemaining)} hours`;
  })();

  const canReturn = order.status === "delivered";
  const canTrack = ["processing", "shipped"].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/profile/orders"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 no-underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </h1>
                <button
                  onClick={handleCopyOrderNumber}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Copy Order Number"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Ordered on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {order.paymentMethod.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color.replace(
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
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  }`}
                >
                  {order.paymentStatus === "paid" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {canTrack && (
              <button
                onClick={handleTrackShipment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                <Truck className="w-4 h-4" />
                Track Shipment
              </button>
            )}

            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading}
            >
              <Download className="w-4 h-4" />
              Download Invoice
            </button>

            <button
              onClick={handleContactSeller}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading}
            >
              <MessageSquare className="w-4 h-4" />
              Contact Seller
            </button>

            {canReturn && (
              <button
                onClick={handleRequestReturn}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={actionLoading}
              >
                <RotateCcw className="w-4 h-4" />
                Request Return
              </button>
            )}

            {canCancel && (
              <div className="ml-auto flex flex-col items-end gap-1">
                {!canCancelWithinTimeLimit && cancellationTimeRemaining === null ? (
                  <div className="text-xs text-red-600 dark:text-red-400 text-right mb-1">
                    Cancellation window expired (1 day limit)
                  </div>
                ) : cancellationTimeRemaining && (
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 text-right mb-1">
                    Cancel within: {cancellationTimeRemaining}
                  </div>
                )}
                <button
                  onClick={handleCancelOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading || !canCancelWithinTimeLimit}
                  title={!canCancelWithinTimeLimit ? "Cancellation window expired. Contact support for assistance." : "Cancel this order"}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="w-20 h-20 flex-shrink-0 relative bg-gray-100 dark:bg-gray-700 rounded">
                      <Image
                        src={item.image || "/assets/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
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

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
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
                {order.shippingAddress.phone && (
                  <p className="flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4" />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors no-underline"
              >
                <MapPin className="w-4 h-4" />
                View on Map
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Method</span>
                  <span className="font-medium">
                    {order.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Status</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === "paid"
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Paid On</span>
                    <span>
                      {new Date(order.paidAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                )}
                {order.paymentId && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Payment ID: {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            {(order.approvedAt || order.shippedAt || order.deliveredAt) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order Placed
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {order.approvedAt && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Order Approved
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.approvedAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.shippedAt && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Order Shipped
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.shippedAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.deliveredAt && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Order Delivered
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.deliveredAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Have questions about your order? We're here to help!
                  </p>
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 no-underline"
                  >
                    Visit Help Center
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
