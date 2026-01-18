
import type { ComponentType, ReactNode } from "react";
import { useState } from "react";

export interface ShopOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
  variant?: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

export interface ShopOrderSummaryProps {
  shopId: string;
  shopName: string;
  items: ShopOrderItem[];
  onApplyCoupon?: (shopId: string, code: string) => Promise<void>;
  onRemoveCoupon?: (shopId: string) => Promise<void>;
  appliedCoupon?: AppliedCoupon | null;
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    objectFit?: string;
  }>;
  PriceComponent: ComponentType<{ amount: number }>;
  freeShippingThreshold?: number;
  shippingCost?: number;
  taxRate?: number;
  icons?: {
    store?: ReactNode;
    tag?: ReactNode;
    close?: ReactNode;
    loader?: ReactNode;
  };
  className?: string;
}

export function ShopOrderSummary({
  shopId,
  shopName,
  items,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  ImageComponent,
  PriceComponent,
  freeShippingThreshold = 5000,
  shippingCost = 100,
  taxRate = 0.18,
  icons,
  className = "",
}: ShopOrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = appliedCoupon?.discountAmount || 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shipping + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onApplyCoupon) return;

    try {
      setCouponLoading(true);
      setCouponError("");
      await onApplyCoupon(shopId, couponCode.toUpperCase());
      setCouponCode("");
    } catch (error: any) {
      setCouponError(error.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!onRemoveCoupon) return;

    try {
      setCouponLoading(true);
      setCouponError("");
      await onRemoveCoupon(shopId);
    } catch (error: any) {
      setCouponError(error.message || "Failed to remove coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  // Default icons (inline SVG)
  const StoreIcon =
    icons?.store ||
    (() => (
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ));

  const TagIcon =
    icons?.tag ||
    (() => (
      <svg
        className="w-4 h-4"
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
        className="w-4 h-4"
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

  const LoaderIcon =
    icons?.loader ||
    (() => (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 ${className}`}
    >
      {/* Shop Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-primary">
          {typeof StoreIcon === "function" ? <StoreIcon /> : StoreIcon}
        </span>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {shopName}
        </h3>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <ImageComponent
              src={item.productImage || "/placeholder.png"}
              alt={item.productName}
              width={64}
              height={64}
              className="rounded"
              objectFit="cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {item.productName}
              </h4>
              {item.variant && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.variant}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Qty: {item.quantity}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                <PriceComponent amount={item.price * item.quantity} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      {(onApplyCoupon || appliedCoupon) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {appliedCoupon ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">
                    {typeof TagIcon === "function" ? <TagIcon /> : TagIcon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      You saved{" "}
                      <PriceComponent amount={appliedCoupon.discountAmount} />
                    </p>
                  </div>
                </div>
                {onRemoveCoupon && (
                  <button
                    onClick={handleRemoveCoupon}
                    disabled={couponLoading}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    {typeof CloseIcon === "function" ? (
                      <CloseIcon />
                    ) : (
                      CloseIcon
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            onApplyCoupon && (
              <div className="space-y-2">
                <label
                  htmlFor={`coupon-${shopId}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Have a coupon for this shop?
                </label>
                <div className="flex gap-2">
                  <input
                    id={`coupon-${shopId}`}
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {couponLoading ? (
                      typeof LoaderIcon === "function" ? (
                        <LoaderIcon />
                      ) : (
                        LoaderIcon
                      )
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {couponError}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Subtotal ({items.length} items)
          </span>
          <span className="text-gray-900 dark:text-white">
            <PriceComponent amount={subtotal} />
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">Discount</span>
            <span className="text-green-600 dark:text-green-400">
              -<PriceComponent amount={discount} />
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="text-gray-900 dark:text-white">
            {shipping === 0 ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                FREE
              </span>
            ) : (
              <PriceComponent amount={shipping} />
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Tax ({Math.round(taxRate * 100)}% GST)
          </span>
          <span className="text-gray-900 dark:text-white">
            <PriceComponent amount={tax} />
          </span>
        </div>

        <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">Shop Total</span>
          <span className="text-primary">
            <PriceComponent amount={total} />
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Add <PriceComponent amount={freeShippingThreshold - subtotal} />{" "}
            more for FREE shipping
          </p>
        )}
      </div>
    </div>
  );
}

