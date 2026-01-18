"use client";

import { VerificationGate } from "@/components/auth/VerificationGate";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { ShopOrderSummary } from "@/components/checkout/ShopOrderSummary";
import { ErrorBoundary } from "@letitrip/react-library";
import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { isInternationalAddress } from "@/lib/validators/address.validator";
import { checkoutService } from "@/services/checkout.service";
import {
  AddressSelectorWithCreate,
  ErrorMessage,
  FormCheckbox,
  FormField,
  FormSelect,
  FormTextarea,
  Price,
  useCart,
  useCheckoutState,
} from "@letitrip/react-library";
import {
  Check,
  ChevronLeft,
  CreditCard,
  FileText,
  Globe,
  Loader2,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

  // Use checkout state hook to manage all checkout state
  const {
    currentStep,
    shippingAddressId,
    shippingAddress,
    billingAddressId,
    paymentMethod,
    currency,
    useSameAddress,
    notes,
    processing,
    error,
    validationErrors,
    shopCoupons,
    availableGateways,
    isInternational,
    loadingGateways,
    setCurrentStep,
    setShippingAddressId,
    setShippingAddress,
    setBillingAddressId,
    setPaymentMethod,
    setCurrency,
    setUseSameAddress,
    setNotes,
    setError,
    setValidationErrors,
    applyCoupon,
    removeCoupon,
    setAvailableGateways,
    setIsInternational,
    setLoadingGateways,
    setProcessing,
  } = useCheckoutState();

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
    const inrTotal = shopGroups.reduce((sum, shop) => {
      const subtotal = shop.items.reduce(
        (s, item) => s + item.price * item.quantity,
        0
      );
      const discount = shop.coupon?.discountAmount || 0;
      const shipping = subtotal >= 5000 ? 0 : 100;
      const tax = Math.round(subtotal * 0.18);
      return sum + (subtotal + shipping + tax - discount);
    }, 0);

    // Convert to selected currency if international
    if (isInternational && currency !== "INR") {
      const conversionRates: Record<string, number> = {
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
      };
      return Math.round(inrTotal * conversionRates[currency] * 100) / 100;
    }

    return inrTotal;
  }, [shopGroups, isInternational, currency]);

  // Update available gateways when shipping address changes
  useEffect(() => {
    const fetchAvailableGateways = async () => {
      if (!shippingAddress) return;

      setLoadingGateways(true);
      try {
        const international = isInternationalAddress({
          line1: shippingAddress.addressLine1,
          line2: shippingAddress.addressLine2 || undefined,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        });
        setIsInternational(international);

        // Determine currency based on country
        let detectedCurrency: "INR" | "USD" | "EUR" | "GBP" = "INR";
        if (international) {
          if (
            shippingAddress.country === "US" ||
            shippingAddress.country === "United States"
          ) {
            detectedCurrency = "USD";
          } else if (
            shippingAddress.country === "GB" ||
            shippingAddress.country === "United Kingdom"
          ) {
            detectedCurrency = "GBP";
          } else if (
            [
              "DE",
              "FR",
              "IT",
              "ES",
              "Germany",
              "France",
              "Italy",
              "Spain",
            ].includes(shippingAddress.country)
          ) {
            detectedCurrency = "EUR";
          } else {
            detectedCurrency = "USD";
          }
        }
        setCurrency(detectedCurrency);

        // Fetch available gateways from API
        const params = new URLSearchParams({
          country: shippingAddress.country,
          currency: detectedCurrency,
          amount: grandTotal.toString(),
        });

        const response = await fetch(
          `/api/payments/available-gateways?${params}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch payment gateways");
        }

        const data = await response.json();
        const gatewayIds = data.gateways.map((g: any) => g.id);

        // Always add COD as fallback
        if (!gatewayIds.includes("cod")) {
          gatewayIds.push("cod");
        }

        setAvailableGateways(gatewayIds);

        // Update payment method if current is not available
        if (!gatewayIds.includes(paymentMethod)) {
          setPaymentMethod(gatewayIds[0] || "cod");
        }
      } catch (error) {
        logError(error as Error, {
          component: "CheckoutPage.fetchAvailableGateways",
          metadata: { address: shippingAddress },
        });
        // Fallback to basic gateway selection
        if (isInternational) {
          setAvailableGateways(["paypal", "cod"]);
          if (paymentMethod === "razorpay") {
            setPaymentMethod("paypal");
          }
        } else {
          setAvailableGateways(["razorpay", "cod"]);
          if (paymentMethod === "paypal") {
            setPaymentMethod("razorpay");
          }
        }
      } finally {
        setLoadingGateways(false);
      }
    };

    fetchAvailableGateways();
  }, [shippingAddress, grandTotal]);

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
    // Clear previous errors
    setValidationErrors({});
    setError(null);

    if (currentStep === "address") {
      const errors: Record<string, string> = {};

      if (!shippingAddressId) {
        errors.shipping = "Please select a shipping address";
      }
      if (!useSameAddress && !billingAddressId) {
        errors.billing = "Please select a billing address";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError("Please complete all required fields to continue.");
        return;
      }

      setCurrentStep("payment");
    } else if (currentStep === "payment") {
      if (!paymentMethod) {
        setError("Please select a payment method");
        return;
      }
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
    try {
      setError(null);

      // Mock coupon validation - in real implementation, call API
      // For now, apply 10% discount
      const shop = shopGroups.find((s) => s.shopId === shopId);
      if (!shop) {
        throw new Error("Shop not found");
      }

      const subtotal = shop.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const discountAmount = Math.round(subtotal * 0.1); // 10% discount

      applyCoupon(shopId, code, discountAmount);
    } catch (error: any) {
      logError(error as Error, {
        component: "CheckoutPage.handleApplyCoupon",
        metadata: { shopId, code },
      });
      setError(error.message || "Failed to apply coupon. Please try again.");
    }
  };

  const handleRemoveCoupon = async (shopId: string) => {
    try {
      setError(null);
      removeCoupon(shopId);
    } catch (error: any) {
      logError(error as Error, {
        component: "CheckoutPage.handleRemoveCoupon",
        metadata: { shopId },
      });
      setError(error.message || "Failed to remove coupon.");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Validate before submission
      if (!shippingAddressId) {
        throw new Error("Please select a shipping address");
      }
      if (!paymentMethod) {
        throw new Error("Please select a payment method");
      }

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

      const result = (await checkoutService.createOrder(orderData)) as {
        orders: Array<{ id: string }>;
        amount: number;
        currency: string;
        total: number;
        razorpay_order_id: string;
      };

      if (paymentMethod === "razorpay") {
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          throw new Error(
            "Payment gateway not available. Please try Cash on Delivery or refresh the page."
          );
        }

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
              logError(error as Error, {
                component: "CheckoutPage.razorpayHandler",
                metadata: {
                  orderIds,
                  razorpay_order_id: response.razorpay_order_id,
                },
              });
              const errorMessage =
                error.message ||
                "Payment verification failed. Please contact support with your payment ID.";
              setError(errorMessage);
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.fullName || user?.email,
            email: user?.email,
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function () {
              setError(
                "Payment was cancelled. Your order has not been placed."
              );
              setProcessing(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response: any) {
          logError(new Error("Payment failed"), {
            component: "CheckoutPage.razorpayPaymentFailed",
            metadata: { error: response.error },
          });
          setError(
            response.error.description ||
              "Payment failed. Please try again or use a different payment method."
          );
          setProcessing(false);
        });
        razorpay.open();
      } else {
        // COD - redirect to success (first order or multi-order page)
        const firstOrderId = result.orders[0].id;
        router.push(`/user/orders/${firstOrderId}?success=true&multi=true`);
      }
    } catch (error: any) {
      logError(error as Error, {
        component: "CheckoutPage.handlePlaceOrder",
        metadata: {
          shippingAddressId,
          paymentMethod,
        },
      });
      const errorMessage =
        error.message || "Failed to place order. Please try again.";
      setError(errorMessage);
      setProcessing(false);
    }
  };

  if (!user || cartLoading || !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <VerificationGate requireEmail requirePhone actionName="checkout">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-5xl mx-auto px-4">
            {/* Error Display */}
            {error && (
              <div className="mb-6">
                <ErrorMessage
                  message={error}
                  showRetry={!processing}
                  onRetry={() => {
                    setError(null);
                    setValidationErrors({});
                  }}
                />
              </div>
            )}

            {/* Validation Errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  Please fix the following errors:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                  {Object.values(validationErrors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Header - Mobile Optimized */}
            <div className="mb-8">
              <button
                onClick={() => router.push("/cart")}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:text-gray-700 transition-colors mb-4 min-h-[44px] touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Cart
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
            </div>

            {/* Progress Steps - Mobile Optimized */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          )}
                        </div>
                        <span
                          className={`mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium ${
                            isCurrent
                              ? "text-primary"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 mx-2 sm:mx-4 rounded transition-all ${
                            isCompleted
                              ? "bg-green-500"
                              : "bg-gray-200 dark:bg-gray-700"
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
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                    <AddressSelectorWithCreate
                      value={shippingAddressId}
                      onChange={(id, address) => {
                        setShippingAddressId(id);
                        setShippingAddress(address);
                      }}
                      label="Shipping Address"
                      required
                      error={validationErrors.shipping}
                      autoSelectDefault
                      filterType="all"
                    />

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <FormCheckbox
                        id="sameAddress"
                        checked={useSameAddress}
                        onChange={(e) => setUseSameAddress(e.target.checked)}
                        label="Billing address same as shipping"
                      />

                      {!useSameAddress && (
                        <div className="mt-4">
                          <AddressSelectorWithCreate
                            value={billingAddressId}
                            onChange={(id) => setBillingAddressId(id)}
                            label="Billing Address"
                            required
                            error={validationErrors.billing}
                            autoSelectDefault={false}
                            filterType="all"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Step */}
                {currentStep === "payment" && (
                  <div className="space-y-6">
                    {isInternational && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                              International Order
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                              This order will be shipped internationally.
                              Available payment methods are shown below.
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <FormField
                            label="Select Currency"
                            hint="Choose your preferred currency"
                          >
                            <FormSelect
                              id="currency-select"
                              value={currency}
                              onChange={(e) =>
                                setCurrency(
                                  e.target.value as
                                    | "INR"
                                    | "USD"
                                    | "EUR"
                                    | "GBP"
                                )
                              }
                              options={[
                                { value: "USD", label: "🇺🇸 USD - US Dollar" },
                                { value: "EUR", label: "🇪🇺 EUR - Euro" },
                                {
                                  value: "GBP",
                                  label: "🇬🇧 GBP - British Pound",
                                },
                                {
                                  value: "INR",
                                  label: "🇮🇳 INR - Indian Rupee",
                                },
                              ]}
                              className="bg-white dark:bg-gray-800"
                            />
                          </FormField>
                        </div>
                      </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                      {loadingGateways ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            Loading payment methods...
                          </span>
                        </div>
                      ) : (
                        <PaymentMethod
                          selected={paymentMethod}
                          onSelect={setPaymentMethod}
                          availableGateways={availableGateways}
                          isInternational={isInternational}
                        />
                      )}
                    </div>
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

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                      <FormField
                        label="Delivery Notes (Optional)"
                        hint="E.g., ring the doorbell twice, leave at gate"
                      >
                        <FormTextarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          placeholder="Add any special instructions for delivery..."
                        />
                      </FormField>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons - Mobile Optimized */}
                <div className="flex gap-3">
                  {currentStep !== "address" && (
                    <button
                      onClick={handleBack}
                      className="btn-secondary flex-1 min-h-[48px] touch-manipulation"
                      disabled={processing}
                    >
                      Back
                    </button>
                  )}
                  {currentStep !== "review" ? (
                    <button
                      onClick={handleContinue}
                      className="btn-primary flex-1 min-h-[48px] touch-manipulation"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      className="btn-primary flex-1 min-h-[48px] touch-manipulation flex items-center justify-center"
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Order Summary
                  </h3>

                  {isInternational && currency !== "INR" && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                        <Globe className="w-4 h-4" />
                        <span>Prices shown in {currency}</span>
                      </div>
                    </div>
                  )}

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

                      // Convert to selected currency if international
                      const conversionRates: Record<string, number> = {
                        USD: 0.012,
                        EUR: 0.011,
                        GBP: 0.0095,
                        INR: 1,
                      };
                      const rate = conversionRates[currency];
                      const convertAmount = (amount: number) =>
                        Math.round(amount * rate * 100) / 100;

                      return (
                        <div
                          key={shop.shopId}
                          className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {shop.shopName}
                          </p>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex justify-between">
                              <span>{shop.items.length} items</span>
                              <span>
                                {isInternational && currency !== "INR" ? (
                                  <span>
                                    {currency}{" "}
                                    {convertAmount(subtotal).toFixed(2)}
                                  </span>
                                ) : (
                                  <Price amount={subtotal} />
                                )}
                              </span>
                            </div>
                            {discount > 0 && (
                              <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>Discount</span>
                                <span>
                                  -
                                  {isInternational && currency !== "INR" ? (
                                    <span>
                                      {currency}{" "}
                                      {convertAmount(discount).toFixed(2)}
                                    </span>
                                  ) : (
                                    <Price amount={discount} />
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span>Shipping</span>
                              <span>
                                {shipping === 0 ? (
                                  "FREE"
                                ) : isInternational && currency !== "INR" ? (
                                  <span>
                                    {currency}{" "}
                                    {convertAmount(shipping).toFixed(2)}
                                  </span>
                                ) : (
                                  <Price amount={shipping} />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax</span>
                              <span>
                                {isInternational && currency !== "INR" ? (
                                  <span>
                                    {currency} {convertAmount(tax).toFixed(2)}
                                  </span>
                                ) : (
                                  <Price amount={tax} />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1">
                              <span>Shop Total</span>
                              <span>
                                {isInternational && currency !== "INR" ? (
                                  <span>
                                    {currency}{" "}
                                    {convertAmount(shopTotal).toFixed(2)}
                                  </span>
                                ) : (
                                  <Price amount={shopTotal} />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-lg font-bold mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      Grand Total
                    </span>
                    <span className="text-primary">
                      {isInternational && currency !== "INR" ? (
                        <span>
                          {currency} {grandTotal.toFixed(2)}
                        </span>
                      ) : (
                        <Price amount={grandTotal} />
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
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
      </VerificationGate>
    </ErrorBoundary>
  );
}
