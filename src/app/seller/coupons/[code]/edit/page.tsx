"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import CouponForm from "@/components/seller/CouponForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { couponsService } from "@/services/coupons.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Coupon } from "@/types";

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const code = params.code as string;

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (code) {
      loadCoupon();
    }
  }, [code]);

  const loadCoupon = async () => {
    try {
      setLoading(true);
      const couponData = await couponsService.getByCode(code);
      setCoupon(couponData);
    } catch (error) {
      console.error("Failed to load coupon:", error);
      alert("Coupon not found");
      router.push("/seller/coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Coupon>) => {
    try {
      setIsSubmitting(true);
      await couponsService.update(code, data);
      alert("Coupon updated successfully!");
      loadCoupon(); // Reload to show updated data
    } catch (error: any) {
      console.error("Failed to update coupon:", error);
      alert(error.message || "Failed to update coupon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await couponsService.delete(code);
      alert("Coupon deleted successfully");
      router.push("/seller/coupons");
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert("Failed to delete coupon. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading coupon...</p>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return null;
  }

  const canDelete = user?.role === "admin";

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/seller/coupons"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Coupons
                </Link>
              </div>

              {canDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Coupon
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 font-mono">
                  {coupon.code}
                </h1>
                <StatusBadge status={coupon.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600">{coupon.name}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200">
            <CouponForm
              mode="edit"
              initialData={coupon}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Usage Stats */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              📊 Usage Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Times Used</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {coupon.usageCount || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Limit</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {coupon.usageLimit || "Unlimited"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Per User Limit</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {coupon.usageLimitPerUser}
                </div>
              </div>
            </div>

            {coupon.usageLimit && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Usage Progress</span>
                  <span>
                    {coupon.usageCount} / {coupon.usageLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
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
