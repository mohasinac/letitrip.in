"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { couponsService } from "@/services/coupons.service";
import type { CouponFE } from "@/types/frontend/coupon.types";
import { toDateInputValue, getTodayDateInputValue } from "@/lib/date-utils";

interface CouponInlineFormProps {
  coupon?: CouponFE;
  shopId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CouponInlineForm({
  coupon,
  shopId,
  onSuccess,
  onCancel,
}: CouponInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    code: coupon?.code || "",
    name: coupon?.name || "",
    type: coupon?.type || "percentage",
    discountValue: coupon?.discountValue || 0,
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    usageLimitPerUser: coupon?.usageLimitPerUser || 1,
    startDate: coupon?.startDate
      ? toDateInputValue(coupon.startDate)
      : getTodayDateInputValue(),
    endDate: coupon?.endDate
      ? toDateInputValue(coupon.endDate)
      : toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Display name is required";
    }
    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    if (formData.type === "percentage" && formData.discountValue > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100%";
    }
    if (!coupon && !shopId) {
      newErrors.form = "Shop ID is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      if (coupon) {
        // Update existing coupon
        await couponsService.update(coupon.code, {
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        } as any);
      } else {
        // Create new coupon
        await couponsService.create({
          ...formData,
          shopId,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          applicability: "all",
          minQuantity: 1,
          firstOrderOnly: false,
          newUsersOnly: false,
          canCombineWithOtherCoupons: true,
          autoApply: false,
          isPublic: true,
          featured: false,
        } as any);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save coupon:", error);
      setErrors({ form: error.message || "Failed to save coupon" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form-level error */}
      {errors.form && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">
            {errors.form}
          </p>
        </div>
      )}

      {/* Code */}
      <div>
        <label
          htmlFor="coupon-code"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Coupon Code *
        </label>
        <input
          id="coupon-code"
          type="text"
          required
          value={formData.code}
          onChange={(e) => {
            setFormData({ ...formData, code: e.target.value.toUpperCase() });
            clearError("code");
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.code
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
          placeholder="SUMMER2024"
          disabled={!!coupon}
        />
        {errors.code && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.code}
          </p>
        )}
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="coupon-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Display Name *
        </label>
        <input
          id="coupon-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            clearError("name");
          }}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
            errors.name
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Type & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="coupon-type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Discount Type *
          </label>
          <select
            id="coupon-type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat Amount</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="coupon-discount-value"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Discount Value *
          </label>
          <input
            id="coupon-discount-value"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.discountValue}
            onChange={(e) => {
              setFormData({
                ...formData,
                discountValue: parseFloat(e.target.value),
              });
              clearError("discountValue");
            }}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              errors.discountValue
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            }`}
          />
          {errors.discountValue && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.discountValue}
            </p>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="coupon-start-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Start Date *
          </label>
          <input
            id="coupon-start-date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor="coupon-end-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            End Date *
          </label>
          <input
            id="coupon-end-date"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {coupon ? "Update Coupon" : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
