"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/orders.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Order } from "@/types";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrder();
    }
  }, [user, params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getById(params.id);
      setOrder(data);
    } catch (error) {
      console.error("Failed to load order:", error);
      router.push("/user/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      await ordersService.downloadInvoice(params.id);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await ordersService.cancel(params.id, {
        reason: "Customer requested cancellation",
      });
      await loadOrder();
      alert("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order");
    }
  };

  if (!user) {
    router.push("/login?redirect=/user/orders");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Order Status
          </h2>
          <OrderTimeline status={order.status} />
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Items ({order.items?.length || 0})
          </h2>
          <div className="space-y-4">
            {order.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex gap-4 pb-4 border-b last:border-b-0"
              >
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {item.productName}
                  </h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{item.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total: ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-700">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ₹{order.subtotal?.toLocaleString()}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order.shipping === 0 ? "FREE" : `₹${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  ₹{order.tax?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">
                  ₹{order.total.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900 uppercase">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Payment Status</span>
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
                      ? "text-gray-900"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-gray-600 mt-1">In progress</p>
              )}
            </div>

            {/* Line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-6 w-0.5 h-16 ${
                  isCompleted ? "bg-primary" : "bg-gray-200"
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
