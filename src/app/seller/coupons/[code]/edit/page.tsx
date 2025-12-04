"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageState } from "@/components/common/PageState";
import { StatusBadge } from "@/components/common/StatusBadge";
import CouponForm from "@/components/seller/CouponForm";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { couponsService } from "@/services/coupons.service";
import type { CouponFE, CouponFormFE } from "@/types/frontend/coupon.types";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const code = params.code as string;

  const {
    data: coupon,
    isLoading,
    execute,
  } = useLoadingState<CouponFE | null>({
    initialData: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoupon = useCallback(async () => {
    try {
      const couponData = await couponsService.getByCode(code);
      return couponData;
    } catch (error) {
      logError(error as Error, {
        component: "SellerCouponEdit.loadCoupon",
        code,
      });
      toast.error("Coupon not found");
      router.push("/seller/coupons");
      return null;
    }
  }, [code, router]);

  useEffect(() => {
    if (code) {
      execute(loadCoupon);
    }
  }, [code, execute, loadCoupon]);

  const handleSubmit = async (data: CouponFormFE) => {
    try {
      setIsSubmitting(true);
      await couponsService.update(code, data);
      toast.success("Coupon updated successfully!");
      execute(loadCoupon); // Reload to show updated data
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerCouponEdit.handleSubmit",
        code,
      });
      toast.error(
        error.message || "Failed to update coupon. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await couponsService.delete(code);
      toast.success("Coupon deleted successfully");
      router.push("/seller/coupons");
    } catch (error) {
      logError(error as Error, {
        component: "SellerCouponEdit.handleDelete",
        code,
      });
      toast.error("Failed to delete coupon. Please try again.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageState.Loading message="Loading coupon..." />;
  }

  if (!coupon) {
    return null;
  }

  const canDelete = user?.role === "admin";

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/seller/coupons"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Coupons
                </Link>
              </div>

              {canDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Coupon
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                  {coupon.code}
                </h1>
                <StatusBadge status={coupon.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {coupon.name}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <CouponForm
              mode="edit"
              initialData={coupon}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Usage Stats */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              📊 Usage Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Times Used
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {coupon.usageCount || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Limit
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {coupon.usageLimit || "Unlimited"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Per User Limit
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {coupon.usageLimitPerUser}
                </div>
              </div>
            </div>

            {coupon.usageLimit && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Usage Progress</span>
                  <span>
                    {coupon.usageCount} / {coupon.usageLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (coupon.usageCount / coupon.usageLimit) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        description={`Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone and will affect any pending orders using this coupon.`}
        confirmLabel="Delete Coupon"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
