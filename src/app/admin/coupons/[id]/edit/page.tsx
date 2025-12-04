"use client";

import { toast } from "@/components/admin/Toast";
import AuthGuard from "@/components/auth/AuthGuard";
import { FormInput, FormSelect, FormTextarea } from "@/components/forms";
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
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    onLoadError: (error) => {
      logError(error, { component: "EditCouponPage.loadCoupon", couponId });
      toast.error("Failed to load coupon");
    },
  });
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    minOrderValue: 0,
    maxUses: null as number | null,
    maxUsesPerUser: 1,
    validFrom: "",
    validTo: "",
    isActive: true,
    applicableTo: "all",
  });

  useEffect(() => {
    loadCoupon();
  }, [couponId]);

  const loadCoupon = () =>
    execute(async () => {
      const coupon: any = await couponsService.getById(couponId);

      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        type: coupon.type || "percentage",
        value: coupon.value || 0,
        minOrderValue: coupon.minOrderValue || 0,
        maxUses: coupon.maxUses,
        maxUsesPerUser: coupon.maxUsesPerUser || 1,
        validFrom: coupon.validFrom
          ? new Date(coupon.validFrom).toISOString().split("T")[0]
          : "",
        validTo: coupon.validTo
          ? new Date(coupon.validTo).toISOString().split("T")[0]
          : "",
        isActive: coupon.isActive ?? true,
        applicableTo: coupon.applicableTo || "all",
      });
    });

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
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
