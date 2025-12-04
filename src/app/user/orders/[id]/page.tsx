"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { PageState } from "@/components/common/PageState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay, Price } from "@/components/common/values";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { ordersService } from "@/services/orders.service";
import type { OrderFE } from "@/types/frontend/order.types";
import {
  CheckCircle,
  ChevronLeft,
  Download,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderFE | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Success state from URL params
  const isSuccess = searchParams.get("success") === "true";
  const isMultiOrder = searchParams.get("multi") === "true";

  // Unwrap async params
  useEffect(() => {
    params.then((p) => setOrderId(p.id));
  }, [params]);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    await execute(async () => {
      const data = await ordersService.getById(orderId);
      setOrder(data);
    });
  }, [orderId, execute]);

  useEffect(() => {
    if (user && orderId) {
      loadOrder();
    }
  }, [user, orderId, loadOrder]);

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    try {
      await ordersService.downloadInvoice(orderId);
    } catch (error) {
      logError(error as Error, {
        component: "OrderDetailPage.downloadInvoice",
        metadata: { orderId },
      });
      toast.error("Failed to download invoice");
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await ordersService.cancel(orderId, "Customer requested cancellation");
      await loadOrder();
      toast.success("Order cancelled successfully");
    } catch (error) {
      logError(error as Error, {
        component: "UserOrderDetail.handleCancelOrder",
        metadata: { orderId },
      });
      toast.error("Failed to cancel order");
    }
  };

  if (!user) {
    router.push("/login?redirect=/user/orders");
    return null;
  }

  if (error) {
    return <PageState.Error message={error.message} onRetry={loadOrder} />;
  }

  if (isLoading) {
    return <PageState.Loading message="Loading order details..." />;
  }

  if (!order) {
    return null;
  }

  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Success Message */}
        {isSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300">
                  {isMultiOrder
                    ? "Orders placed successfully!"
                    : "Order placed successfully!"}
                </h3>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  {isMultiOrder
                    ? "You can view all your orders below."
                    : "Your order has been confirmed and is being processed."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Placed on{" "}
                <DateDisplay
                  date={order.createdAt}
                  format="short"
                  className="inline"
                />
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Invoice
              </button>
              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  className="btn-secondary text-red-600 border-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Order Status
          </h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Items ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-b-0"
              >
                <OptimizedImage
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.productName}
                  width={80}
                  height={80}
                  className="rounded"
                  objectFit="cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    <Price amount={item.price} />
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total: <Price amount={item.price * item.quantity} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-700 dark:text-gray-300">
              <p className="font-medium">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.line1}</p>
              {order.shippingAddress?.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
              </p>
              <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-900 dark:text-white">
                  <Price amount={order.subtotal || 0} />
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>
                    -<Price amount={order.discount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="text-gray-900 dark:text-white">
                  {order.shipping === 0 ? (
                    "FREE"
                  ) : (
                    <Price amount={order.shipping || 0} />
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-white">
                  <Price amount={order.tax || 0} />
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t dark:border-gray-700 font-semibold text-lg">
                <span className="dark:text-white">Total</span>
                <span className="text-primary">
                  <Price amount={order.total} />
                </span>
              </div>
              <div className="pt-2 border-t dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Payment Method
                  </span>
                  <span className="text-gray-900 dark:text-white uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Payment Status
                  </span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { id: "pending", label: "Order Placed", icon: Package },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle },
    { id: "processing", label: "Processing", icon: Package },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const statusIndex = steps.findIndex((s) => s.id === status);
  const isCancelled = status === "cancelled";
  const isReturned = status === "returned";

  if (isCancelled || isReturned) {
    return (
      <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
        <XCircle className="w-6 h-6" />
        <div>
          <p className="font-semibold">
            Order {isCancelled ? "Cancelled" : "Returned"}
          </p>
          <p className="text-sm">
            {isCancelled
              ? "This order has been cancelled"
              : "This order has been returned"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= statusIndex;
        const isCurrent = index === statusIndex;

        return (
          <div key={step.id} className="flex items-start gap-4 mb-8 last:mb-0">
            {/* Icon */}
            <div
              className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <p
                className={`font-semibold ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  In progress
                </p>
              )}
            </div>

            {/* Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-6 w-0.5 h-16 ${
                  isCompleted ? "bg-primary" : "bg-gray-200 dark:bg-gray-600"
                }`}
                style={{ top: `${(index + 1) * 80}px` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
