"use client";

import { toast } from "@/components/admin/Toast";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { couponsService } from "@/services/coupons.service";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCouponPage() {
  const router = useRouter();
  const { execute } = useLoadingState({
    onLoadError: (error) => {
      logError(error, { component: "CreateCouponPage.handleSubmit" });
      toast.error("Failed to create coupon");
    },
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    minOrderValue: 0,
    maxUses: null,
    maxUsesPerUser: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
    isActive: true,
    applicableTo: "all",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    await execute(async () => {
      await couponsService.create(formData as any);
      toast.success("Coupon created successfully");
      router.push("/admin/coupons");
    });
    setLoading(false);
  };

  return (
    <AuthGuard requireAuth allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Coupons
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Coupon
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Coupon Code"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="SAVE20"
                />

                <FormSelect
                  label="Discount Type"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "flat", label: "Flat Amount" },
                    { value: "free-shipping", label: "Free Shipping" },
                  ]}
                />
              </div>

              <FormTextarea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Enter coupon description"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Discount Value"
                  type="number"
                  required
                  min={0}
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      value: Number(e.target.value),
                    })
                  }
                />

                <FormInput
                  label="Min Order Value"
                  type="number"
                  min={0}
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderValue: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Valid From"
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />

                <FormInput
                  label="Valid Until"
                  type="date"
                  required
                  value={formData.validTo}
                  onChange={(e) =>
                    setFormData({ ...formData, validTo: e.target.value })
                  }
                />
              </div>

              <FormCheckbox
                id="isActive"
                label="Active immediately"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
