"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Ticket,
  AlertCircle,
  Check,
  Percent,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { FormInput } from "@/components/forms";
import { Price, DateDisplay } from "@/components/common/values";
import { couponsService } from "@/services/coupons.service";
import type { CouponFE } from "@/types/frontend/coupon.types";

export interface CouponSelectorProps {
  cartTotal: number;
  items: {
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }[];
  onApply: (coupon: CouponFE, discount: number) => void;
  onRemove: () => void;
  appliedCouponCode?: string;
  className?: string;
}

export function CouponSelector({
  cartTotal,
  items,
  onApply,
  onRemove,
  appliedCouponCode,
  className = "",
}: CouponSelectorProps) {
  const {
    isLoading: loading,
    data: availableCoupons,
    setData: setAvailableCoupons,
    execute,
  } = useLoadingState<CouponFE[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error as Error, { component: "CouponSelector.loadCoupons" });
      toast.error("Failed to load coupons");
    },
  });

  const [manualCode, setManualCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [bestCoupon, setBestCoupon] = useState<CouponFE | null>(null);

  useEffect(() => {
    loadCoupons();
  }, [cartTotal]);

  const loadCoupons = () =>
    execute(async () => {
      const response = await couponsService.list({
        limit: 20,
      });

      const coupons = (response.data || []).filter(
        (c) => c.status === "active",
      );

      // Find best coupon
      if (coupons.length > 0) {
        const validCoupons = coupons.filter((c) => {
          if (c.minPurchaseAmount && cartTotal < c.minPurchaseAmount) {
            return false;
          }
          return true;
        });

        if (validCoupons.length > 0) {
          const best = validCoupons.reduce((prev, current) => {
            const prevDiscount = calculateDiscount(prev);
            const currentDiscount = calculateDiscount(current);
            return currentDiscount > prevDiscount ? current : prev;
          });
          setBestCoupon(best);
        }
      }

      return coupons;
    });

  const calculateDiscount = (coupon: CouponFE): number => {
    if (coupon.type === "percentage") {
      const value = coupon.discountValue || 0;
      let discount = (cartTotal * value) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
      return discount;
    } else {
      return Math.min(coupon.discountValue || 0, cartTotal);
    }
  };

  const handleApplyCoupon = async (coupon: CouponFE) => {
    setValidating(true);
    try {
      // Validate coupon
      const validation = await couponsService.validate({
        code: coupon.code,
        cartTotal,
        items,
      });

      if (validation.valid) {
        onApply(coupon, validation.discount);
        toast.success(`Coupon applied! You saved ₹${validation.discount}`);
      } else {
        toast.error(validation.message || "Invalid coupon");
      }
    } catch (error: any) {
      logError(error as Error, { component: "CouponSelector.handleApplyCoupon" });
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setValidating(false);
    }
  };

  const handleManualApply = async () => {
    if (!manualCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setValidating(true);
    try {
      const validation = await couponsService.validate({
        code: manualCode.trim().toUpperCase(),
        cartTotal,
        items,
      });

      if (validation.valid) {
        // Find the coupon details
        const coupon = (availableCoupons || []).find(
          (c) => c.code === manualCode.trim().toUpperCase(),
        );
        if (coupon) {
          onApply(coupon, validation.discount);
          toast.success(`Coupon applied! You saved ₹${validation.discount}`);
          setManualCode("");
        } else {
          toast.error("Coupon not found");
        }
      } else {
        toast.error(validation.message || "Invalid coupon");
      }
    } catch (error: any) {
      logError(error as Error, { component: "CouponSelector.handleManualApply" });
      toast.error(error.message || "Failed to apply coupon");
    } finally {
      setValidating(false);
    }
  };

  const isExpiringSoon = (expiryDate: Date): boolean => {
    const daysUntilExpiry = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 3;
  };

  const displayedCoupons = showAll
    ? availableCoupons || []
    : (availableCoupons || []).slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          Loading coupons...
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Ticket className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Apply Coupon
        </h3>
      </div>

      {/* Manual Code Entry */}
      <div className="flex gap-2">
        <FormInput
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 uppercase"
          disabled={validating}
        />
        <button
          onClick={handleManualApply}
          disabled={validating || !manualCode.trim()}
          className="btn-primary whitespace-nowrap"
        >
          {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </button>
      </div>

      {/* Applied Coupon */}
      {appliedCouponCode && (
        <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {appliedCouponCode}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Coupon applied successfully
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Available Coupons */}
      {(availableCoupons || []).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Available Coupons ({(availableCoupons || []).length})
          </p>

          {displayedCoupons.map((coupon) => {
            const discount = calculateDiscount(coupon);
            const isEligible =
              !coupon.minPurchaseAmount ||
              cartTotal >= coupon.minPurchaseAmount;
            const isApplied = appliedCouponCode === coupon.code;
            const isBest = bestCoupon?.code === coupon.code;

            return (
              <div
                key={coupon.id}
                className={`
                  p-4 rounded-lg border
                  ${
                    isApplied
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : isEligible
                        ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-60"
                  }
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Coupon Info */}
                  <div className="flex-1 min-w-0">
                    {/* Code & Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono font-bold text-lg text-primary">
                        {coupon.code}
                      </span>
                      {isBest && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                          Best Value
                        </span>
                      )}
                      {isExpiringSoon(coupon.endDate) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          Expiring Soon
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {coupon.description}
                    </p>

                    {/* Discount Display */}
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Save <Price amount={discount} />
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      {coupon.minPurchaseAmount && (
                        <span>
                          Min: <Price amount={coupon.minPurchaseAmount} />
                        </span>
                      )}
                      {coupon.maxDiscountAmount &&
                        coupon.type === "percentage" && (
                          <span>
                            Max: <Price amount={coupon.maxDiscountAmount} />
                          </span>
                        )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <DateDisplay date={coupon.endDate} />
                      </span>
                    </div>

                    {/* Eligibility Warning */}
                    {!isEligible && coupon.minPurchaseAmount && (
                      <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                        Add{" "}
                        <Price amount={coupon.minPurchaseAmount - cartTotal} />{" "}
                        more to unlock this coupon
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  {!isApplied && (
                    <button
                      onClick={() => handleApplyCoupon(coupon)}
                      disabled={!isEligible || validating}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                        ${
                          isEligible
                            ? "bg-primary text-white hover:bg-primary-dark"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }
                      `}
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Show More/Less */}
          {(availableCoupons || []).length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-2 text-sm text-primary hover:underline"
            >
              {showAll
                ? "Show Less"
                : `Show ${(availableCoupons || []).length - 3} More Coupons`}
            </button>
          )}
        </div>
      )}

      {/* No Coupons */}
      {(!availableCoupons || availableCoupons.length === 0) && (
        <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No coupons available at this time
          </p>
        </div>
      )}
    </div>
  );
}

export default CouponSelector;
