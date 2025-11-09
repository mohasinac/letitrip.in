"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import DateTimePicker from "@/components/common/DateTimePicker";
import TagInput from "@/components/common/TagInput";
import type { Coupon, CouponType } from "@/types";

interface CouponFormProps {
  mode: "create" | "edit";
  initialData?: Partial<Coupon>;
  shopId?: string;
  onSubmit: (data: Partial<Coupon>) => void;
  isSubmitting?: boolean;
}

const COUPON_TYPES: {
  value: CouponType;
  label: string;
  description: string;
}[] = [
  { value: "percentage", label: "Percentage", description: "e.g., 10% off" },
  { value: "flat", label: "Flat Amount", description: "e.g., ₹100 off" },
  { value: "bogo", label: "BOGO", description: "Buy One Get One" },
  { value: "tiered", label: "Tiered", description: "Spend more, save more" },
  {
    value: "free-shipping",
    label: "Free Shipping",
    description: "No shipping charges",
  },
];

const APPLICABILITY_OPTIONS = [
  {
    value: "all",
    label: "All Products",
    description: "Applies to entire shop",
  },
  {
    value: "category",
    label: "Specific Categories",
    description: "Choose categories",
  },
  {
    value: "product",
    label: "Specific Products",
    description: "Choose products",
  },
];

export default function CouponForm({
  mode,
  initialData,
  shopId,
  onSubmit,
  isSubmitting = false,
}: CouponFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    shopId: initialData?.shopId || shopId || "",
    type: (initialData?.type as CouponType) || "percentage",
    discountValue: initialData?.discountValue || 0,
    maxDiscountAmount: initialData?.maxDiscountAmount || 0,
    minPurchaseAmount: initialData?.minPurchaseAmount || 0,
    minQuantity: initialData?.minQuantity || 1,
    applicability: initialData?.applicability || "all",
    applicableCategories: initialData?.applicableCategories || [],
    applicableProducts: initialData?.applicableProducts || [],
    usageLimit: initialData?.usageLimit || undefined,
    usageLimitPerUser: initialData?.usageLimitPerUser || 1,
    startDate: initialData?.startDate || new Date(),
    endDate:
      initialData?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: initialData?.status || "active",
    firstOrderOnly: initialData?.firstOrderOnly || false,
  });

  const [codeError, setCodeError] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Validate coupon code
  const validateCode = async (code: string) => {
    if (!code || code.length < 3) {
      setCodeError("");
      return;
    }

    // Only validate in create mode or if code changed in edit mode
    if (mode === "edit" && code === initialData?.code) {
      setCodeError("");
      return;
    }

    setIsValidatingCode(true);
    setCodeError("");

    try {
      const response = await fetch(
        `/api/coupons/validate-code?code=${encodeURIComponent(code)}&shop_id=${
          formData.shopId
        }`,
      );
      const data = await response.json();

      if (!data.available) {
        setCodeError("This coupon code is already in use");
      }
    } catch (error) {
      console.error("Failed to validate code:", error);
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Debounced code validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.code) {
        validateCode(formData.code);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.code, formData.shopId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (codeError) {
      alert("Please fix validation errors");
      return;
    }

    if (!formData.shopId) {
      alert("Shop ID is required");
      return;
    }

    if (!formData.code) {
      alert("Coupon code is required");
      return;
    }

    onSubmit(formData);
  };

  const handleCodeChange = (value: string) => {
    // Auto-uppercase and remove invalid characters
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setFormData({ ...formData, code: sanitized });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        {/* Coupon Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => handleCodeChange(e.target.value)}
              disabled={mode === "edit"}
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 ${
                codeError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } ${mode === "edit" ? "bg-gray-50 cursor-not-allowed" : ""}`}
              placeholder="SUMMER2024"
              maxLength={20}
            />
            {isValidatingCode && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          {codeError && (
            <p className="mt-1 text-xs text-red-600">{codeError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Use uppercase letters, numbers, and hyphens only (3-20 characters)
          </p>
        </div>

        {/* Coupon Name */}
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
            placeholder="Summer Sale 2024"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Additional details about this coupon..."
            maxLength={500}
          />
        </div>
      </div>

      {/* Discount Configuration */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Discount Configuration
        </h3>

        {/* Coupon Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discount Type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COUPON_TYPES.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.type === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CouponType,
                    })
                  }
                  className="mt-1 h-4 w-4 text-blue-600"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Discount Value (for percentage and flat) */}
        {(formData.type === "percentage" || formData.type === "flat") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *{" "}
                {formData.type === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.type === "percentage" ? "100" : undefined}
                step={formData.type === "percentage" ? "1" : "0.01"}
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

            {formData.type === "percentage" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscountAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value
                        ? parseFloat(e.target.value)
                        : 0,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for no limit
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Minimum Purchase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Purchase Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minPurchaseAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minPurchaseAmount: parseFloat(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Minimum Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.minQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minQuantity: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Applicability */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Applicability</h3>

        {/* Applicability Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Applies To *
          </label>
          <div className="space-y-2">
            {APPLICABILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="applicability"
                  value={option.value}
                  checked={formData.applicability === option.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applicability: e.target.value as any,
                    })
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Category/Product Selection */}
        {formData.applicability === "category" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable Categories
            </label>
            <TagInput
              value={formData.applicableCategories || []}
              onChange={(tags: string[]) =>
                setFormData({ ...formData, applicableCategories: tags })
              }
              placeholder="Enter category IDs..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter category IDs (e.g., electronics, fashion)
            </p>
          </div>
        )}

        {formData.applicability === "product" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicable Products
            </label>
            <TagInput
              value={formData.applicableProducts || []}
              onChange={(tags: string[]) =>
                setFormData({ ...formData, applicableProducts: tags })
              }
              placeholder="Enter product slugs..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter product slugs (e.g., iphone-14-pro)
            </p>
          </div>
        )}
      </div>

      {/* Usage Limits */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Usage Limits</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Usage Limit
            </label>
            <input
              type="number"
              min="0"
              value={formData.usageLimit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimit: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Unlimited"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty for unlimited
            </p>
          </div>

          {/* Per User Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit Per User *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.usageLimitPerUser}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimitPerUser: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Validity Period</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <DateTimePicker
              value={formData.startDate}
              onChange={(date: Date | null) => {
                if (date) setFormData({ ...formData, startDate: date });
              }}
              minDate={new Date()}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <DateTimePicker
              value={formData.endDate}
              onChange={(date: Date | null) => {
                if (date) setFormData({ ...formData, endDate: date });
              }}
              minDate={formData.startDate}
            />
          </div>
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Restrictions</h3>

        <div className="space-y-3">
          {/* First Order Only */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.firstOrderOnly}
              onChange={(e) =>
                setFormData({ ...formData, firstOrderOnly: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              First order only (valid for new customers)
            </span>
          </label>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Status</h3>

        <div className="flex items-center gap-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === "active"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="status"
              value="inactive"
              checked={formData.status === "inactive"}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Inactive</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || !!codeError}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Coupon" : "Update Coupon"}
        </button>
      </div>
    </form>
  );
}
