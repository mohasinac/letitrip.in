"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CouponForm from "@/components/seller/CouponForm";
import { couponsService } from "@/services/coupons.service";
import type { CouponFormFE } from "@/types/frontend/coupon.types";

export default function CreateCouponPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CouponFormFE) => {
    try {
      setIsSubmitting(true);

      // Create the coupon
      const newCoupon = await couponsService.create(data as any);

      // Redirect to edit page after successful creation
      router.push(`/seller/coupons/${newCoupon.code}/edit`);
    } catch (error: any) {
      console.error("Failed to create coupon:", error);
      toast.error(
        error.message || "Failed to create coupon. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/seller/coupons"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Coupons
            </Link>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Coupon
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a discount coupon for your shop
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <CouponForm
            mode="create"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            💡 Coupon Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Use memorable coupon codes (e.g., SUMMER2024, FIRSTBUY)</li>
            <li>• Set appropriate validity periods to create urgency</li>
            <li>• Consider minimum purchase amounts to increase order value</li>
            <li>• Limit usage per user to prevent abuse</li>
            <li>• Test the coupon before sharing with customers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
