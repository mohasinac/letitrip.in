/**
 * @fileoverview React Component
 * @module src/components/seller/CouponInlineForm
 * @description This file contains the CouponInlineForm component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/firebase-error-logger";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { couponsService } from "@/services/coupons.service";
import type { CouponFE } from "@/types/frontend/coupon.types";
import { toDateInputValue, getTodayDateInputValue } from "@/lib/date-utils";

/**
 * CouponInlineFormProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CouponInlineFormProps
 */
interface CouponInlineFormProps {
  /** Coupon */
  coupon?: CouponFE;
  /** Shop Id */
  shopId?: string;
  /** On Success */
  onSuccess: () => void;
  /** On Cancel */
  onCancel: () => void;
}

/**
 * Function: Coupon Inline Form
 */
/**
 * Performs coupon inline form operation
 *
 * @returns {any} The couponinlineform result
 *
 * @example
 * CouponInlineForm();
 */

/**
 * Performs coupon inline form operation
 *
 * @returns {any} The couponinlineform result
 *
 * @example
 * CouponInlineForm();
 */

export function CouponInlineForm({
  coupon,
  shopId,
  onSuccess,
  onCancel,
}: CouponInlineFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    /** Code */
    code: coupon?.code || "",
    /** Name */
    name: coupon?.name || "",
    /** Type */
    type: coupon?.type || "percentage",
    /** Discount Value */
    discountValue: coupon?.discountValue || 0,
    /** Min Purchase Amount */
    minPurchaseAmount: coupon?.minPurchaseAmount || 0,
    /** Usage Limit Per User */
    usageLimitPerUser: coupon?.usageLimitPerUser || 1,
    /** Start Date */
    startDate: coupon?.startDate
      ? toDateInputValue(coupon.startDate)
      : getTodayDateInputValue(),
    /** End Date */
    endDate: coupon?.endDate
      ? toDateInputValue(coupon.endDate)
      : toDateInputValue(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });

  /**
   * Performs clear error operation
   *
   * @param {string} field - The field
   *
   * @returns {string} The clearerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs clear error operation
   *
   * @param {string} field - The field
   *
   * @returns {string} The clearerror result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Performs async operation
   *
   * @param {React.FormEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {React.FormEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
          /** Start Date */
          startDate: new Date(formData.startDate),
          /** End Date */
          endDate: new Date(formData.endDate),
        } as any);
      } else {
        // Create new coupon
        await couponsService.create({
          ...formData,
          shopId,
          /** Start Date */
          startDate: new Date(formData.startDate),
          /** End Date */
          endDate: new Date(formData.endDate),
          /** Applicability */
          applicability: "all",
          /** Min Quantity */
          minQuantity: 1,
          /** First Order Only */
          firstOrderOnly: false,
          /** New Users Only */
          newUsersOnly: false,
          /** Can Combine With Other Coupons */
          canCombineWithOtherCoupons: true,
          /** Auto Apply */
          autoApply: false,
          /** Is Public */
          isPublic: true,
          /** Featured */
          featured: false,
        } as any);
      }

      onSuccess();
    } catch (error: any) {
      logError(error as Error, {
        /** Component */
        component: "CouponInlineForm.handleSubmit",
        /** Metadata */
        metadata: { couponCode: formData.code },
      });
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
        <FormInput
          id="coupon-code"
          label="Coupon Code"
          required
          value={formData.code}
          onChange={(e) => {
            setFormData({ ...formData, code: e.target.value.toUpperCase() });
            clearError("code");
          }}
          className="font-mono uppercase"
          placeholder="SUMMER2024"
          disabled={!!coupon}
          error={errors.code}
        />
      </div>

      {/* Name */}
      <div>
        <FormInput
          id="coupon-name"
          label="Display Name"
          required
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            clearError("name");
          }}
          error={errors.name}
        />
      </div>

      {/* Type & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormSelect
            id="coupon-type"
            label="Discount Type"
            required
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "flat", label: "Flat Amount" },
            ]}
          />
        </div>
        <div>
          <FormInput
            id="coupon-discount-value"
            label="Discount Value"
            type="number"
            required
            min={0}
            step={0.01}
            value={formData.discountValue}
            onChange={(e) => {
              setFormData({
                ...formData,
                /** Discount Value */
                discountValue: parseFloat(e.target.value),
              });
              clearError("discountValue");
            }}
            error={errors.discountValue}
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormInput
            id="coupon-start-date"
            label="Start Date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />
        </div>
        <div>
          <FormInput
            id="coupon-end-date"
            label="End Date"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
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
