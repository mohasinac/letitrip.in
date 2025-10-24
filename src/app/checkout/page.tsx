/**
 * Enhanced Checkout Page with Coupon and Payment Integration
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";
import {
  CreditCardIcon,
  TruckIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface ShippingRate {
  courier_name: string;
  freight_charge: number;
  cod_charges: number;
  other_charges: number;
  total_charge: number;
  etd: string;
}

interface CouponValidation {
  valid: boolean;
  coupon?: any;
  discountAmount?: number;
  error?: string;
  warnings?: string[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items: cart, clearCart } = useCart();

  // Helper function to safely get auth token
  const getAuthToken = async (): Promise<string | null> => {
    if (!user?.getIdToken) {
      return null;
    }
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  };

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay"
  );
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(
    null
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(
    null
  );
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const shippingCharges = selectedShipping?.total_charge || 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shippingCharges - discount;

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cart.length === 0) {
      router.push("/cart");
      return;
    }

    loadAddresses();
    loadRazorpayScript();
  }, [user, cart]);

  useEffect(() => {
    if (selectedAddress) {
      loadShippingRates();
    }
  }, [selectedAddress]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  };

  const loadAddresses = async () => {
    try {
      if (!user?.getIdToken) {
        toast.error("Authentication required");
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("/api/user/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data || []);

        // Select default address
        const defaultAddress = data.data?.find(
          (addr: Address) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (data.data?.length > 0) {
          setSelectedAddress(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Load addresses error:", error);
      toast.error("Failed to load addresses");
    }
  };

  const loadShippingRates = async () => {
    if (!selectedAddress) return;

    setIsLoadingShipping(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/shipping/shiprocket/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pickup_postcode: "110001", // Your pickup location pincode
          delivery_postcode: selectedAddress.pincode,
          weight: 0.5, // Calculate based on cart items
          cod: paymentMethod === "cod" ? 1 : 0,
          declared_value: subtotal,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShippingRates(data.data || []);

        // Select the first available shipping option
        if (data.data?.length > 0) {
          setSelectedShipping(data.data[0]);
        }
      } else {
        toast.error("Failed to load shipping rates");
      }
    } catch (error) {
      console.error("Load shipping rates error:", error);
      toast.error("Failed to load shipping rates");
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          cartItems: cart,
          subtotal,
        }),
      });

      const data = await response.json();
      if (data.success && data.data.valid) {
        setAppliedCoupon(data.data);
        toast.success(`Coupon applied! You saved ₹${data.data.discountAmount}`);
      } else {
        toast.error(data.data?.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Validate coupon error:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const createRazorpayOrder = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      const response = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            cartItems: JSON.stringify(cart),
            couponCode: appliedCoupon?.coupon?.code,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error("Failed to create payment order");
      }
    } catch (error) {
      console.error("Create Razorpay order error:", error);
      throw error;
    }
  };

  const processRazorpayPayment = async (orderData: any) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JustForView Store",
        description: "Order Payment",
        order_id: orderData.id,
        prefill: {
          name: user?.displayName || selectedAddress?.name,
          email: user?.email,
          contact: selectedAddress?.phone,
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const token = await getAuthToken();
            if (!token) {
              toast.error("Authentication required");
              return;
            }
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
              }),
            });

            if (verifyResponse.ok) {
              resolve(response);
            } else {
              reject(new Error("Payment verification failed"));
            }
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => {
            reject(new Error("Payment cancelled by user"));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const createOrder = async (paymentData?: any) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      const orderPayload = {
        items: cart,
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress,
        paymentMethod,
        paymentData,
        subtotal,
        shippingCharges,
        discount,
        total,
        couponCode: appliedCoupon?.coupon?.code,
        courierName: selectedShipping?.courier_name,
        estimatedDelivery: selectedShipping?.etd,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    if (!selectedShipping) {
      toast.error("Please select a shipping option");
      return;
    }

    setIsProcessingOrder(true);

    try {
      if (paymentMethod === "razorpay") {
        if (!razorpayLoaded) {
          toast.error("Payment system is loading, please try again");
          return;
        }

        // Create Razorpay order
        const razorpayOrder = await createRazorpayOrder();

        // Process payment
        const paymentResponse = await processRazorpayPayment(razorpayOrder);

        // Create order with payment data
        const order = await createOrder(paymentResponse);

        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${order.id}`);
      } else {
        // Cash on Delivery
        const order = await createOrder();

        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/orders/${order.id}`);
      }
    } catch (error: any) {
      console.error("Place order error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (!user || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Delivery Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    <TruckIcon className="inline h-5 w-5 mr-2" />
                    Delivery Address
                  </h2>

                  {addresses.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">No addresses found</p>
                      <button
                        onClick={() => router.push("/addresses")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Add Address
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            selectedAddress?.id === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {address.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {address.phone}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.addressLine1},{" "}
                                {address.addressLine2 &&
                                  `${address.addressLine2}, `}
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>
                            </div>
                            <input
                              type="radio"
                              checked={selectedAddress?.id === address.id}
                              onChange={() => setSelectedAddress(address)}
                              className="h-4 w-4 text-blue-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Shipping Options */}
                {selectedAddress && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      <TruckIcon className="inline h-5 w-5 mr-2" />
                      Shipping Options
                    </h2>

                    {isLoadingShipping ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                          Loading shipping rates...
                        </span>
                      </div>
                    ) : shippingRates.length === 0 ? (
                      <p className="text-gray-500 py-4">
                        No shipping options available for this location
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {shippingRates.map((rate, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 cursor-pointer ${
                              selectedShipping?.courier_name ===
                              rate.courier_name
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedShipping(rate)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {rate.courier_name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  <ClockIcon className="inline h-4 w-4 mr-1" />
                                  Expected delivery: {rate.etd}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  ₹{rate.total_charge}
                                </p>
                                <input
                                  type="radio"
                                  checked={
                                    selectedShipping?.courier_name ===
                                    rate.courier_name
                                  }
                                  onChange={() => setSelectedShipping(rate)}
                                  className="h-4 w-4 text-blue-600 mt-2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    <CreditCardIcon className="inline h-5 w-5 mr-2" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "razorpay"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("razorpay")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Online Payment
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pay securely with Razorpay
                          </p>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === "razorpay"}
                          onChange={() => setPaymentMethod("razorpay")}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Cash on Delivery
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pay when you receive your order
                          </p>
                        </div>
                        <input
                          type="radio"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4 w-4 text-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h2>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      <TagIcon className="inline h-4 w-4 mr-1" />
                      Apply Coupon
                    </h3>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-green-900">
                            {appliedCoupon.coupon.code}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button
                          onClick={validateCoupon}
                          disabled={isValidatingCoupon}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isValidatingCoupon ? "Validating..." : "Apply"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-900">
                        ₹{shippingCharges.toFixed(2)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount</span>
                        <span className="text-green-600">
                          -₹{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      isProcessingOrder || !selectedAddress || !selectedShipping
                    }
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingOrder
                      ? "Processing..."
                      : `Place Order - ₹${total.toFixed(2)}`}
                  </button>

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    By placing your order, you agree to our Terms & Conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
