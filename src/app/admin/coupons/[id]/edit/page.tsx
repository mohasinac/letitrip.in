/**
 * @fileoverview React Component
 * @module src/app/admin/coupons/[id]/edit/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { toast } from "@/components/admin/Toast";
import AuthGuard from "@/components/auth/AuthGuard";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { couponsService } from "@/services/coupons.service";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;

  const {
    /** Is Loading */
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    /** On Load Error */
    onLoadError: (error) => {
      logError(error, { component: "EditCouponPage.loadCoupon", couponId });
      toast.error("Failed to load coupon");
    },
  });
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    /** Code */
    code: "",
    /** Description */
    description: "",
    /** Type */
    type: "percentage",
    /** Value */
    value: 0,
    /** Min Order Value */
    minOrderValue: 0,
    /** Max Uses */
    maxUses: null as number | null,
    /** Max Uses Per User */
    maxUsesPerUser: 1,
    /** Valid From */
    validFrom: "",
    /** Valid To */
    validTo: "",
    /** Is Active */
    isActive: true,
    /** Applicable To */
    applicableTo: "all",
  });

  useEffect(() => {
    loadCoupon();
  }, [couponId]);

  /**
   * Fetches coupon from server
   *
   * @returns {Promise<any>} Promise resolving to coupon result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches coupon from server
   *
   * @returns {Promise<any>} Promise resolving to coupon result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadCoupon = () =>
    execute(async () => {
      const coupon: any = await couponsService.getById(couponId);

      setFormData({
        /** Code */
        code: coupon.code || "",
        /** Description */
        description: coupon.description || "",
        /** Type */
        type: coupon.type || "percentage",
        /** Value */
        value: coupon.value || 0,
        /** Min Order Value */
        minOrderValue: coupon.minOrderValue || 0,
        /** Max Uses */
        maxUses: coupon.maxUses,
        /** Max Uses Per User */
        maxUsesPerUser: coupon.maxUsesPerUser || 1,
        /** Valid From */
        validFrom: coupon.validFrom
          ? new Date(coupon.validFrom).toISOString().split("T")[0]
          : "",
        /** Valid To */
        validTo: coupon.validTo
          ? new Date(coupon.validTo).toISOString().split("T")[0]
          : "",
        /** Is Active */
        isActive: coupon.isActive ?? true,
        /** Applicable To */
        applicableTo: coupon.applicableTo || "all",
      });
    });

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

    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (formData.type !== "free-shipping" && formData.value <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    try {
      setSaving(true);
      await couponsService.update(couponId, formData as any);
      toast.success("Coupon updated successfully");
      router.push("/admin/coupons");
    } catch (error: any) {
      console.error("Failed to update coupon:", error);
      toast.error(error.message || "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles change event
   *
   * @param {React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >} e - The e
   *
   * @returns {any} The handlechange result
   */

  /**
   * Handles change event
   *
   * @returns {any} The handlechange result
   */

  const handleChange = (
    /** E */
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      /**
       * Performs checked operation
       *
       * @param {any} e.target as HTMLInputElement).checked;
      setFormData((prev - The e.target as  h t m l input element).checked;
      set form data((prev
       *
       * @returns {any} The checked result
       */

      /**
       * Performs checked operation
       *
       * @param {any} e.target as HTMLInputElement).checked;
      setFormData((prev - The e.target as  h t m l input element).checked;
      set form data((prev
       *
       * @returns {any} The checked result
       */

      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === "code") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <AuthGuard requireAuth allowedRoles={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
              <p className="text-gray-600 mt-1">
                Update discount coupon details
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 space-y-6"
          >
            {/* Coupon Code */}
            <FormInput
              label="Coupon Code"
              required
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="font-mono uppercase"
              placeholder="SUMMER2024"
              disabled
              helperText="Coupon code cannot be changed after creation"
            />

            {/* Description */}
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Save 20% on all items"
            />

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Discount Type"
                required
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: "percentage", label: "Percentage Off" },
                  { value: "flat", label: "Flat Discount (₹)" },
                  { value: "free-shipping", label: "Free Shipping" },
                ]}
              />

              {formData.type !== "free-shipping" && (
                <FormInput
                  label="Discount Value"
                  required
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min={0}
                  step={formData.type === "percentage" ? 1 : 0.01}
                  rightAddon={formData.type === "percentage" ? "%" : "₹"}
                />
              )}
            </div>

            {/* Minimum Order Value */}
            <FormInput
              label="Minimum Order Value (₹)"
              type="number"
              name="minOrderValue"
              value={formData.minOrderValue}
              onChange={handleChange}
              min={0}
              step={0.01}
            />

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Total Usage Limit"
                type="number"
                name="maxUses"
                value={formData.maxUses || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    /** Max Uses */
                    maxUses: value ? parseInt(value) : null,
                  }));
                }}
                min={1}
                placeholder="Unlimited"
                helperText="Leave empty for unlimited uses"
              />

              <FormInput
                label="Uses Per User"
                required
                type="number"
                name="maxUsesPerUser"
                value={formData.maxUsesPerUser}
                onChange={handleChange}
                min={1}
              />
            </div>

            {/* Valid Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Valid From"
                required
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
              />

              <FormInput
                label="Valid Until"
                required
                type="date"
                name="validTo"
                value={formData.validTo}
                onChange={handleChange}
                min={formData.validFrom}
              />
            </div>

            {/* Applicable To */}
            <FormSelect
              label="Applicable To"
              name="applicableTo"
              value={formData.applicableTo}
              onChange={handleChange}
              options={[
                { value: "all", label: "All Products" },
                { value: "category", label: "Specific Categories" },
                { value: "product", label: "Specific Products" },
              ]}
            />

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Active (users can apply this coupon)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Coupon
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
