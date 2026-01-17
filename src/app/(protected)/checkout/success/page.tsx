"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorMessage } from "@letitrip/react-library";
import { Price } from "@letitrip/react-library";
import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { checkoutService } from "@/services/checkout.service";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Loader2,
  Package,
  Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  estimatedDelivery: Date;
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [paymentCaptured, setPaymentCaptured] = useState(false);

  // Extract query parameters
  const orderId = searchParams.get("orderId");
  const paypalOrderId = searchParams.get("token"); // PayPal order ID
  const paypalPayerId = searchParams.get("PayerID"); // PayPal payer ID
  const isMultiOrder = searchParams.get("multi") === "true";
  const paymentMethod = searchParams.get("payment") || "razorpay";

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // If PayPal payment, capture it first
    if (
      paymentMethod === "paypal" &&
      paypalOrderId &&
      paypalPayerId &&
      !paymentCaptured
    ) {
      capturePayPalPayment();
    } else if (orderId) {
      loadOrderDetails();
    } else {
      setError("Invalid order information. Please check your order history.");
      setLoading(false);
    }
  }, [user, orderId, paypalOrderId, paypalPayerId, paymentMethod]);

  const capturePayPalPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      const result = (await checkoutService.capturePayPalPayment({
        orderId: paypalOrderId!,
        payerId: paypalPayerId!,
      })) as { orders?: any[] };

      setPaymentCaptured(true);

      // Load order details after successful capture
      if (result.orders && result.orders.length > 0) {
        setOrders(result.orders);
      }

      setLoading(false);
      setProcessing(false);
    } catch (error: any) {
      logError(error as Error, {
        component: "CheckoutSuccessPage.capturePayPalPayment",
        metadata: { paypalOrderId, paypalPayerId },
      });
      setError(
        error.message ||
          "Failed to process PayPal payment. Please contact support."
      );
      setLoading(false);
      setProcessing(false);
    }
  };

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderData = (await checkoutService.getOrderDetails(orderId!)) as {
        orders?: any[];
      };
      setOrders(orderData.orders || [orderData]);
      setLoading(false);
    } catch (error: any) {
      logError(error as Error, {
        component: "CheckoutSuccessPage.loadOrderDetails",
        metadata: { orderId },
      });
      setError(error.message || "Failed to load order details.");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (loading || processing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-center">
          {processing
            ? "Processing your payment..."
            : "Loading order details..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <ErrorMessage message={error} showRetry={false} />
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/user/orders")}
                className="btn-secondary inline-flex items-center gap-2"
              >
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Thank you for your purchase. Your order
              {isMultiOrder ? "s have" : " has"} been confirmed.
            </p>

            {paymentMethod === "paypal" && paymentCaptured && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                <CreditCard className="w-4 h-4" />
                PayPal payment processed successfully
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4"
            >
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isMultiOrder &&
                      `Shop Order ${index + 1} of ${orders.length}`}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Total</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {order.currency !== "INR" ? (
                        <span>
                          {order.currency} {order.total.toFixed(2)}
                        </span>
                      ) : (
                        <Price amount={order.total} />
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm">
                      {order.paymentMethod === "paypal" && "PayPal"}
                      {order.paymentMethod === "razorpay" &&
                        "Online Payment (Razorpay)"}
                      {order.paymentMethod === "cod" && "Cash on Delivery"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Delivery</p>
                    <p className="text-sm">
                      {new Date(order.estimatedDelivery).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                  ✓
                </span>
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                  ✓
                </span>
                <span>Track your order status in the Orders section</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                  ✓
                </span>
                <span>You'll be notified when your order is shipped</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push("/user/orders")}
              className="btn-primary flex items-center justify-center gap-2 min-h-[48px]"
            >
              View My Orders
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary flex items-center justify-center gap-2 min-h-[48px]"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading order details...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
