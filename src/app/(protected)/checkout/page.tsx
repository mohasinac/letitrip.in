/**
 * Checkout Page
 *
 * Multi-step checkout flow with address selection, payment, and order confirmation.
 * Supports Razorpay and PhonePe payment gateways.
 *
 * Features:
 * - Address selection with create modal
 * - Coupon code input with validation
 * - Payment method selection
 * - Order summary with price breakdown
 * - Payment gateway integration
 * - Order confirmation
 *
 * @page /(protected)/checkout - Checkout page
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout | Let It Rip",
  description: "Complete your order with secure checkout.",
};

// Mock data
const addresses = [
  {
    id: "addr-1",
    name: "Home",
    fullName: "John Doe",
    phone: "+91 9876543210",
    addressLine1: "123 Main Street",
    addressLine2: "Apartment 4B",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Office",
    fullName: "John Doe",
    phone: "+91 9876543210",
    addressLine1: "456 Business Park",
    addressLine2: "Floor 5",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    isDefault: false,
  },
];

const cartItems = [
  { name: "Samsung Galaxy S23", quantity: 1, price: 74999 },
  { name: "Sony Headphones", quantity: 2, price: 29990 },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CheckoutPage() {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 50000 ? 0 : 99;
  const discount = 0; // Will be updated when coupon is applied
  const total = subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your purchase
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delivery Address
                </h2>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                >
                  + Add New Address
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className="flex items-start gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      defaultChecked={address.isDefault}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {address.name}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.fullName} • {address.phone}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Edit address"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Apply Coupon
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Apply
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Have a coupon? Enter it here to get discounts
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Razorpay
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Credit/Debit Card, UPI, Net Banking, Wallets
                    </p>
                  </div>
                  <img
                    src="/payments/razorpay.svg"
                    alt="Razorpay"
                    className="h-6"
                  />
                </label>

                {/* PhonePe */}
                <label className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="phonepe"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      PhonePe
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pay using PhonePe UPI
                    </p>
                  </div>
                  <img
                    src="/payments/phonepe.svg"
                    alt="PhonePe"
                    className="h-6"
                  />
                </label>

                {/* Cash on Delivery */}
                <label className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Cash on Delivery
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pay when you receive
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (GST 18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        FREE
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition mb-3"
              >
                Place Order
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
