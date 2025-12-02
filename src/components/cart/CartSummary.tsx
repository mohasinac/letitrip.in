"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, X, Loader2, ShoppingBag } from "lucide-react";
import { FormLabel } from "@/components/forms";
import { Price } from "@/components/common/values";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
  couponCode?: string;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => Promise<void>;
  onCheckout?: () => void;
  loading?: boolean;
}

export function CartSummary({
  subtotal,
  shipping,
  tax,
  discount,
  total,
  itemCount,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  loading = false,
}: CartSummaryProps) {
  const router = useRouter();
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !onApplyCoupon) return;

    try {
      setApplyingCoupon(true);
      setCouponError("");
      await onApplyCoupon(couponInput.trim().toUpperCase());
      setCouponInput("");
    } catch (error: any) {
      setCouponError(error.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!onRemoveCoupon) return;

    try {
      await onRemoveCoupon();
      setCouponError("");
    } catch (error) {
      console.error("Failed to remove coupon:", error);
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push("/checkout");
    }
  };

  const freeShippingThreshold = 5000;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const showFreeShippingProgress =
    subtotal > 0 && subtotal < freeShippingThreshold;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Free Shipping Progress */}
      {showFreeShippingProgress && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-900">
              Add <Price amount={amountToFreeShipping} /> more for FREE shipping
            </span>
            <span className="text-blue-600 font-medium">
              {Math.round((subtotal / freeShippingThreshold) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  (subtotal / freeShippingThreshold) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {!couponCode && onApplyCoupon && (
        <div className="mb-4">
          <FormLabel htmlFor="cart-coupon-input">Have a coupon code?</FormLabel>
          <div className="flex gap-2">
            <input
              id="cart-coupon-input"
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError("");
              }}
              placeholder="Enter code"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={applyingCoupon}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim() || applyingCoupon}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {applyingCoupon ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>
          {couponError && (
            <p className="mt-1 text-xs text-red-600">{couponError}</p>
          )}
        </div>
      )}

      {/* Applied Coupon */}
      {couponCode && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                {couponCode}
              </span>
            </div>
            {onRemoveCoupon && (
              <button
                onClick={handleRemoveCoupon}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded"
                title="Remove coupon"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-green-700">
            You saved <Price amount={discount} />!
          </p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-medium text-gray-900">
            <Price amount={subtotal} />
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -<Price amount={discount} />
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              <Price amount={shipping} />
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (GST 18%)</span>
          <span className="font-medium text-gray-900">
            <Price amount={tax} />
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            <Price amount={total} />
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || itemCount === 0}
        className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Proceed to Checkout
          </>
        )}
      </button>

      {/* Security Note */}
      <p className="mt-3 text-xs text-center text-gray-600">
        🔒 Secure checkout powered by Razorpay
      </p>
    </div>
  );
}
