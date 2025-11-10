"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Loader2,
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { ShopOrderSummary } from "@/components/checkout/ShopOrderSummary";
import { checkoutService } from "@/services/checkout.service";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CheckoutStep = "address" | "payment" | "review";

interface ShopGroup {
  shopId: string;
  shopName: string;
  items: any[];
  coupon?: {
    code: string;
    discountAmount: number;
  } | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [billingAddressId, setBillingAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay"
  );
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [shopCoupons, setShopCoupons] = useState<
    Record<string, { code: string; discountAmount: number }>
  >({});

  // Group cart items by shop
  const shopGroups = useMemo(() => {
    if (!cart?.items) return [];

    const groups: Record<string, ShopGroup> = {};

    cart.items.forEach((item: any) => {
      if (!groups[item.shopId]) {
        groups[item.shopId] = {
          shopId: item.shopId,
          shopName: item.shopName || "Unknown Shop",
          items: [],
          coupon: shopCoupons[item.shopId] || null,
        };
      }
      groups[item.shopId].items.push(item);
    });

    return Object.values(groups);
  }, [cart?.items, shopCoupons]);

  // Calculate grand total across all shops
  const grandTotal = useMemo(() => {
    return shopGroups.reduce((sum, shop) => {
      const subtotal = shop.items.reduce(
        (s, item) => s + item.price * item.quantity,
        0
      );
      const discount = shop.coupon?.discountAmount || 0;
      const shipping = subtotal >= 5000 ? 0 : 100;
      const tax = Math.round(subtotal * 0.18);
      return sum + (subtotal + shipping + tax - discount);
    }, 0);
  }, [shopGroups]);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push("/cart");
    }
  }, [user, cart, cartLoading, router]);

  const steps = [
    { id: "address", label: "Shipping", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: FileText },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleContinue = () => {
    if (currentStep === "address") {
      if (!shippingAddressId) {
        alert("Please select a shipping address");
        return;
      }
      if (!useSameAddress && !billingAddressId) {
        alert("Please select a billing address");
        return;
      }
      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("address");
    } else if (currentStep === "review") {
      setCurrentStep("payment");
    }
  };

  const handleApplyCoupon = async (shopId: string, code: string) => {
    // Mock coupon validation - in real implementation, call API
    // For now, apply 10% discount
    const shop = shopGroups.find((s) => s.shopId === shopId);
    if (!shop) return;

    const subtotal = shop.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = Math.round(subtotal * 0.1); // 10% discount

    setShopCoupons((prev) => ({
      ...prev,
      [shopId]: { code, discountAmount },
    }));
  };

  const handleRemoveCoupon = async (shopId: string) => {
    setShopCoupons((prev) => {
      const updated = { ...prev };
      delete updated[shopId];
      return updated;
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);

      const orderData = {
        shippingAddressId,
        billingAddressId: useSameAddress ? shippingAddressId : billingAddressId,
        paymentMethod,
        shopOrders: shopGroups.map((shop) => ({
          shopId: shop.shopId,
          shopName: shop.shopName,
          items: shop.items,
          couponCode: shop.coupon?.code,
        })),
        notes: notes || undefined,
      };

      const result = await checkoutService.createOrder(orderData);

      if (paymentMethod === "razorpay") {
        // Initialize Razorpay
        const orderIds = result.orders.map((o: any) => o.id);
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "test_key",
          amount: result.amount,
          currency: result.currency,
          name: "Letitrip",
          description: `${result.orders.length} order(s) - Total ₹${result.total}`,
          order_id: result.razorpay_order_id,
          handler: async function (response: any) {
            try {
              await checkoutService.verifyPayment({
                order_ids: orderIds,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Redirect to first order (or create a multi-order success page)
              router.push(
                `/user/orders/${orderIds[0]}?success=true&multi=true`
              );
            } catch (error: any) {
              alert(error.message || "Payment verification failed");
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.name || user?.email,
            email: user?.email,
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // COD - redirect to success (first order or multi-order page)
        const firstOrderId = result.orders[0].id;
        router.push(`/user/orders/${firstOrderId}?success=true&multi=true`);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to place order");
      setProcessing(false);
    }
  };

  if (!user || cartLoading || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isCurrent ? "text-primary" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded transition-all ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Step */}
            {currentStep === "address" && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <AddressSelector
                  selectedId={shippingAddressId}
                  onSelect={setShippingAddressId}
                  type="shipping"
                />

                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label
                      htmlFor="sameAddress"
                      className="text-sm text-gray-700"
                    >
                      Billing address same as shipping
                    </label>
                  </div>

                  {!useSameAddress && (
                    <AddressSelector
                      selectedId={billingAddressId}
                      onSelect={setBillingAddressId}
                      type="billing"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <PaymentMethod
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>
            )}

            {/* Review Step */}
            {currentStep === "review" && (
              <div className="space-y-6">
                {shopGroups.map((shop) => (
                  <ShopOrderSummary
                    key={shop.shopId}
                    shopId={shop.shopId}
                    shopName={shop.shopName}
                    items={shop.items}
                    appliedCoupon={shopCoupons[shop.shopId]}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                  />
                ))}

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Delivery Notes (Optional)
                  </h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Add any special instructions for delivery..."
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentStep !== "address" && (
                <button
                  onClick={handleBack}
                  className="btn-secondary flex-1"
                  disabled={processing}
                >
                  Back
                </button>
              )}
              {currentStep !== "review" ? (
                <button onClick={handleContinue} className="btn-primary flex-1">
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="btn-primary flex-1"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-4">
                {shopGroups.map((shop) => {
                  const subtotal = shop.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const discount =
                    shopCoupons[shop.shopId]?.discountAmount || 0;
                  const shipping = subtotal >= 5000 ? 0 : 100;
                  const tax = Math.round(subtotal * 0.18);
                  const shopTotal = subtotal + shipping + tax - discount;

                  return (
                    <div
                      key={shop.shopId}
                      className="pb-4 border-b last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {shop.shopName}
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>{shop.items.length} items</span>
                          <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-₹{discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>
                            {shipping === 0 ? "FREE" : `₹${shipping}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 pt-1">
                          <span>Shop Total</span>
                          <span>₹{shopTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-lg font-bold mb-6 pt-4 border-t">
                <span>Grand Total</span>
                <span className="text-primary">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Safe and secure payments</p>
                <p>✓ Easy returns and refunds</p>
                <p>✓ 100% authentic products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
