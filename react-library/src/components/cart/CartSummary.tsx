
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

export interface CartSummaryProps {
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
  PriceComponent: ComponentType<{ amount: number }>;
  FormLabelComponent: ComponentType<{
    htmlFor: string;
    children: ReactNode;
  }>;
  freeShippingThreshold?: number;
  taxRate?: number;
  taxLabel?: string;
  icons?: {
    loader?: ReactNode;
    shoppingBag?: ReactNode;
    tag?: ReactNode;
    close?: ReactNode;
  };
  className?: string;
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
  PriceComponent,
  FormLabelComponent,
  freeShippingThreshold = 5000,
  taxRate = 18,
  taxLabel = "Tax (GST 18%)",
  icons,
  className = "",
}: CartSummaryProps) {
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

  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const showFreeShippingProgress =
    subtotal > 0 && subtotal < freeShippingThreshold;

  // Default icons (inline SVG)
  const LoaderIcon =
    icons?.loader ||
    (() => (
      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    ));

  const ShoppingBagIcon =
    icons?.shoppingBag ||
    (() => (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ));

  const TagIcon =
    icons?.tag ||
    (() => (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ));

  const CloseIcon =
    icons?.close ||
    (() => (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ));

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 sticky top-4 ${className}`}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>

      {/* Free Shipping Progress */}
      {showFreeShippingProgress && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-900">
              Add <PriceComponent amount={amountToFreeShipping} /> more for FREE
              shipping
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
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {!couponCode && onApplyCoupon && (
        <div className="mb-4">
          <FormLabelComponent htmlFor="cart-coupon-input">
            Have a coupon code?
          </FormLabelComponent>
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
                  {typeof LoaderIcon === "function" ? (
                    <LoaderIcon />
                  ) : (
                    LoaderIcon
                  )}
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
              <span className="text-green-600">
                {typeof TagIcon === "function" ? <TagIcon /> : TagIcon}
              </span>
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
                {typeof CloseIcon === "function" ? <CloseIcon /> : CloseIcon}
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-green-700">
            You saved <PriceComponent amount={discount} />!
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
            <PriceComponent amount={subtotal} />
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">
              -<PriceComponent amount={discount} />
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600">FREE</span>
            ) : (
              <PriceComponent amount={shipping} />
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{taxLabel}</span>
          <span className="font-medium text-gray-900">
            <PriceComponent amount={tax} />
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-gray-900">
            <PriceComponent amount={total} />
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Inclusive of all taxes</p>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={loading || itemCount === 0}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              {typeof LoaderIcon === "function" ? <LoaderIcon /> : LoaderIcon}
              Processing...
            </>
          ) : (
            <>
              {typeof ShoppingBagIcon === "function" ? (
                <ShoppingBagIcon />
              ) : (
                ShoppingBagIcon
              )}
              Proceed to Checkout
            </>
          )}
        </button>
      )}

      {/* Security Note */}
      <p className="mt-3 text-xs text-center text-gray-600">
        🔒 Secure checkout powered by Razorpay
      </p>
    </div>
  );
}

