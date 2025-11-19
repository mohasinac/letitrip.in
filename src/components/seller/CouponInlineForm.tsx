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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code) {
      alert("Coupon code is required");
      return;
    }

    try {
      setLoading(true);

      if (coupon) {
        // Update existing coupon
        await couponsService.update(coupon.code, {
          ...formData,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
        } as any);
      } else {
        // Create new coupon
        if (!shopId) {
          alert("Shop ID is required");
          return;
        }

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
    } catch (error) {
      console.error("Failed to save coupon:", error);
      alert("Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coupon Code *
        </label>
        <input
          type="text"
          required
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="SUMMER2024"
          disabled={!!coupon}
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Type & Discount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat Amount</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Value *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.discountValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountValue: parseFloat(e.target.value),
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date *
          </label>
          <input
            type="date"
            required
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
