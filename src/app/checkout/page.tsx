"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAddresses } from "@/hooks/useAddresses";
import AddressCard from "@/components/address/AddressCard";
import AddressForm from "@/components/address/AddressForm";
import { AddressFormData } from "@/types/address";
import { Plus, ShoppingBag, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import Script from "next/script";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal } = useCart();
  const { formatPrice, currency, exchangeRates } = useCurrency();
  const { addresses, isLoading: addressesLoading, addAddress } = useAddresses();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "paypal" | "cod"
  >("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon & Discount state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Get exchange rate for selected currency
  const currentExchangeRate = exchangeRates[currency] || 1;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  // Select default address automatically
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = async (data: AddressFormData) => {
    const success = await addAddress(data);
    if (success) {
      setShowAddressForm(false);
    }
    return success;
  };

  // Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      if (!user || !user.getIdToken) {
        throw new Error("Authentication required");
      }
      const token = await user.getIdToken();

      const response = await fetch("/api/seller/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          couponCode: couponCode.toUpperCase(),
          cartItems: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            sellerId: item.sellerId || "default-seller",
          })),
          cartSubtotal: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
        setCouponDiscount(0);
        return;
      }

      // Coupon applied successfully
      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discount.amount);
      toast.success(
        `Coupon applied! You saved ${formatPrice(data.discount.amount)}`
      );
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      setCouponError(error.message || "Failed to validate coupon");
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError("");
    toast.success("Coupon removed");
  };

  // Calculate totals
  const shipping = subtotal > 1000 ? 0 : 50;
  const afterDiscount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round(afterDiscount * 0.18); // 18% GST on discounted amount
  const total = afterDiscount + shipping + tax;

  // Set COD as default if order is free
  useEffect(() => {
    if (total === 0 && paymentMethod !== "cod") {
      setPaymentMethod("cod");
      toast.success("Payment method set to COD for free order");
    }
  }, [total]);

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);

      // Get ID token
      if (!user || !user.getIdToken) {
        throw new Error("Authentication required");
      }
      const token = await user.getIdToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Load Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JustForView",
        description: "Order Payment",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // First create the order
            const selectedAddress = addresses.find(
              (addr) => addr.id === selectedAddressId
            );
            if (!selectedAddress) {
              throw new Error("Please select a shipping address");
            }

            const orderCreateResponse = await fetch("/api/orders/create", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                items: items.map((item) => ({
                  id: item.id,
                  productId: item.productId,
                  name: item.name,
                  image: item.image || "/assets/placeholder.png",
                  price: item.price,
                  quantity: item.quantity,
                  sku: item.sku || "",
                  sellerId: item.sellerId || "default-seller",
                  sellerName: item.sellerName || "JustForView",
                  slug: item.slug || "",
                })),
                shippingAddress: {
                  fullName: selectedAddress.fullName,
                  phone: selectedAddress.phone,
                  addressLine1: selectedAddress.addressLine1,
                  addressLine2: selectedAddress.addressLine2,
                  city: selectedAddress.city,
                  state: selectedAddress.state,
                  pincode: selectedAddress.pincode,
                  country: "India",
                },
                billingAddress: {
                  fullName: selectedAddress.fullName,
                  phone: selectedAddress.phone,
                  addressLine1: selectedAddress.addressLine1,
                  addressLine2: selectedAddress.addressLine2,
                  city: selectedAddress.city,
                  state: selectedAddress.state,
                  pincode: selectedAddress.pincode,
                  country: "India",
                },
                paymentMethod: "razorpay",
                currency: currency,
                exchangeRate: currentExchangeRate,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
              }),
            });

            if (!orderCreateResponse.ok) {
              throw new Error("Failed to create order");
            }

            const orderCreateData = await orderCreateResponse.json();

            // Then verify payment
            const verifyResponse = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderCreateData.orderId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            toast.success("Payment successful!");
            router.push(`/orders/${orderCreateData.orderId}/confirmation`);
          } catch (error: any) {
            console.error("Order creation error:", error);
            toast.error(error.message || "Failed to complete order");
          }
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  // Handle PayPal Payment
  const handlePayPalPayment = async () => {
    toast.error("PayPal integration coming soon!");
    // PayPal implementation will be added with PayPal Buttons component
  };

  // Handle COD Order
  const handleCODOrder = async () => {
    try {
      setIsProcessing(true);

      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      if (!selectedAddress) {
        toast.error("Please select a shipping address");
        return;
      }

      if (!user || !user.getIdToken) {
        throw new Error("Authentication required");
      }
      const token = await user.getIdToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            image: item.image || "/assets/placeholder.png",
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || "",
            sellerId: item.sellerId || "default-seller",
            sellerName: item.sellerName || "JustForView",
            slug: item.slug || "",
          })),
          shippingAddress: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            country: "India",
          },
          billingAddress: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            country: "India",
          },
          paymentMethod: "cod",
          currency: currency,
          exchangeRate: currentExchangeRate,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }

      const data = await response.json();
      toast.success("Order placed successfully!");
      router.push(`/orders/${data.orderId}/confirmation`);
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Place Order button click
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "paypal") {
      await handlePayPalPayment();
    } else if (paymentMethod === "cod") {
      await handleCODOrder();
    }
  };

  // Redirect to cart if empty
  if (!authLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading || addressesLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment gateway")}
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  1. Shipping Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No saved addresses. Please add a shipping address.
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selectable
                      selected={selectedAddressId === address.id}
                      onSelect={() => setSelectedAddressId(address.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                2. Payment Method
              </h2>

              {total === 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    🎉 Your order total is ₹0. Payment method is automatically
                    set to Cash on Delivery (COD).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Razorpay */}
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-blue-400 dark:hover:border-blue-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Razorpay (Recommended)
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Credit/Debit Cards, UPI, Net Banking, Wallets
                      </div>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-blue-400 dark:hover:border-blue-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        PayPal (International)
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        +7% processing fee for international payments
                      </div>
                    </div>
                  </label>

                  {/* COD */}
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-blue-400 dark:hover:border-blue-500">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Cash on Delivery
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Pay when you receive your order
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 relative bg-gray-100 dark:bg-gray-700 rounded">
                      <Image
                        src={item.image || "/assets/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 py-4 border-t border-gray-200 dark:border-gray-700">
                {/* Coupon Input */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Have a coupon code?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isValidatingCoupon}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {appliedCoupon.name || "Coupon applied"}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (GST 18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {shipping > 0 && subtotal < 1000 && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    💡 Add {formatPrice(1000 - subtotal)} more for free shipping
                  </p>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {total === 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    🎉 Your order is free! Payment set to COD.
                  </p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || isProcessing}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Place Order - {formatPrice(total)}
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Address Form */}
        {showAddressForm && (
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setShowAddressForm(false)}
            isLoading={addressesLoading}
          />
        )}
      </div>
    </>
  );
}
