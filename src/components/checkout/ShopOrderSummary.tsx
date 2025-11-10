"use client";

import { useState } from "react";
import { Tag, X, Loader2, Store } from "lucide-react";

interface ShopOrderSummaryProps {
  shopId: string;
  shopName: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    price: number;
    quantity: number;
    variant?: string;
  }>;
  onApplyCoupon?: (shopId: string, code: string) => Promise<void>;
  onRemoveCoupon?: (shopId: string) => Promise<void>;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  } | null;
}

export function ShopOrderSummary({
  shopId,
  shopName,
  items,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
}: ShopOrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = appliedCoupon?.discountAmount || 0;
  const shipping = subtotal >= 5000 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      {/* Shop Header */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Store className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-gray-900">{shopName}</h3>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <img
              src={item.productImage || "/placeholder.png"}
              alt={item.productName}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.productName}</h4>
              {item.variant && (
                <p className="text-xs text-gray-500">{item.variant}</p>
              )}
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Section */}
      <div className="border-t pt-4">
        {appliedCoupon ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-green-700">
                    You saved ₹{appliedCoupon.discountAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                disabled={couponLoading}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Have a coupon for this shop?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                placeholder="Enter coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={couponLoading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || couponLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {couponLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            {couponError && (
              <p className="text-sm text-red-600">{couponError}</p>
            )}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
          <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="text-green-600">
              -₹{discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              `₹${shipping}`
            )}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (18% GST)</span>
          <span className="text-gray-900">₹{tax.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-base font-semibold pt-2 border-t">
          <span>Shop Total</span>
          <span className="text-primary">₹{total.toLocaleString()}</span>
        </div>

        {shipping > 0 && (
          <p className="text-xs text-gray-500">
            💡 Add ₹{(5000 - subtotal).toLocaleString()} more for FREE shipping
          </p>
        )}
      </div>
    </div>
  );
}
