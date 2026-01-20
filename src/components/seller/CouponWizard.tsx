/**
 * CouponWizard Component
 * 
 * Multi-step wizard for creating and editing coupons/discount codes.
 * 
 * Features:
 * - 2-step non-linear navigation with step indicators
 * - Step 1: Basic info (code, description, type, value, dates)
 * - Step 2: Restrictions (min order, max discount, usage limits, applicable products)
 * - Inline validation with error badges
 * - Always-visible Save/Finish button
 * - Mobile responsive
 * 
 * @component CouponWizard
 * @example
 * ```tsx
 * <CouponWizard couponId="coup-123" onComplete={() => router.push('/seller/coupons')} />
 * ```
 */

"use client";

import { useState, useEffect } from "react";

interface CouponFormData {
  // Step 1: Basic Info
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";

  // Step 2: Restrictions
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usagePerUser?: number;
  applicableProducts: "all" | "specific";
  productIds?: string[];
  firstOrderOnly: boolean;
}

interface CouponWizardProps {
  couponId?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function CouponWizard({
  couponId,
  onComplete,
  onCancel,
}: CouponWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    startDate: "",
    endDate: "",
    status: "active",
    applicableProducts: "all",
    firstOrderOnly: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing coupon if editing
  useEffect(() => {
    if (couponId) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [couponId]);

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Coupon details",
      isComplete: !!(
        formData.code &&
        formData.description &&
        formData.value &&
        formData.startDate &&
        formData.endDate
      ),
    },
    {
      number: 2,
      title: "Restrictions",
      description: "Usage limits",
      isComplete: true, // Optional step
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.code) newErrors.code = "Coupon code is required";
      if (formData.code && !/^[A-Z0-9-]+$/.test(formData.code))
        newErrors.code = "Code must be uppercase letters, numbers, and hyphens only";
      if (!formData.description)
        newErrors.description = "Description is required";
      if (!formData.value || formData.value <= 0)
        newErrors.value = "Valid value is required";
      if (formData.type === "percentage" && formData.value > 100)
        newErrors.value = "Percentage cannot exceed 100";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end <= start) {
          newErrors.endDate = "End date must be after start date";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || steps[step - 1].isComplete) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return;

    setIsLoading(true);

    try {
      // TODO: Submit to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error("Failed to save coupon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {couponId ? "Edit Coupon" : "Create Coupon"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create discount codes to offer to customers
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.number)}
                  disabled={
                    step.number > currentStep && !steps[index].isComplete
                  }
                  className={`flex items-center gap-3 ${
                    step.number > currentStep && !steps[index].isComplete
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:opacity-80"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step.number === currentStep
                        ? "bg-blue-600 text-white"
                        : step.isComplete
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step.isComplete && step.number !== currentStep ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      steps[index + 1].isComplete || currentStep > step.number
                        ? "bg-green-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Coupon Details
              </h2>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className={`flex-1 px-4 py-2 border ${errors.code ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white font-mono`}
                    placeholder="SUMMER2024"
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Generate
                  </button>
                </div>
                {errors.code && (
                  <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Uppercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  placeholder="Describe what this coupon is for"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Discount Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="value"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="value"
                      value={formData.value || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          value: parseFloat(e.target.value),
                        })
                      }
                      className={`w-full px-4 py-2 border ${errors.value ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                      placeholder="0"
                      min={0}
                      max={formData.type === "percentage" ? 100 : undefined}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      {formData.type === "percentage" ? "%" : "₹"}
                    </span>
                  </div>
                  {errors.value && (
                    <p className="mt-1 text-sm text-red-500">{errors.value}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${errors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Restrictions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Usage Restrictions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="minOrderValue"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    id="minOrderValue"
                    value={formData.minOrderValue || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Leave empty for no minimum
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxDiscount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Maximum Discount (₹)
                  </label>
                  <input
                    type="number"
                    id="maxDiscount"
                    value={formData.maxDiscount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxDiscount: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                    disabled={formData.type === "fixed"}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formData.type === "percentage"
                      ? "Leave empty for no cap"
                      : "Not applicable for fixed amount"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="usageLimit"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    value={formData.usageLimit || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usageLimit: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="Unlimited"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Max times coupon can be used
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="usagePerUser"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Usage Per User
                  </label>
                  <input
                    type="number"
                    id="usagePerUser"
                    value={formData.usagePerUser || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        usagePerUser: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="Unlimited"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Max times per user
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Applicable Products
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="all-products"
                      name="applicableProducts"
                      value="all"
                      checked={formData.applicableProducts === "all"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicableProducts: e.target.value as "all" | "specific",
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="all-products"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      All Products
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="specific-products"
                      name="applicableProducts"
                      value="specific"
                      checked={formData.applicableProducts === "specific"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          applicableProducts: e.target.value as "all" | "specific",
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="specific-products"
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Specific Products Only
                    </label>
                  </div>

                  {formData.applicableProducts === "specific" && (
                    <div className="ml-7 mt-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        + Select Products
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Choose which products this coupon applies to
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="firstOrderOnly"
                    checked={formData.firstOrderOnly}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstOrderOnly: e.target.checked,
                      })
                    }
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label
                      htmlFor="firstOrderOnly"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      First Order Only
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Limit this coupon to customers making their first purchase
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Create Coupon"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
