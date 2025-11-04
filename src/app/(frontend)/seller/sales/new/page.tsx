"use client";

import React, { useState } from "react";
import { Save, ArrowLeft, Info } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api/seller";
import {
  UnifiedCard,
  CardContent,
  UnifiedButton,
  UnifiedInput,
  UnifiedSelect,
  UnifiedTextarea,
  UnifiedSwitch,
  UnifiedAlert,
} from "@/components/ui/unified";

interface SaleFormData {
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applyTo: "all_products" | "specific_products" | "specific_categories";
  productIds: string[];
  categoryIds: string[];
  enableFreeShipping: boolean;
  startDate: string;
  endDate: string;
  isPermanent: boolean;
  status: "active" | "inactive" | "scheduled";
}

export default function CreateSalePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    variant: "success",
  });

  useBreadcrumbTracker([
    { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
    { label: "Sales", href: SELLER_ROUTES.SALES },
    { label: "Create Sale", href: SELLER_ROUTES.SALES_NEW, active: true },
  ]);

  const [formData, setFormData] = useState<SaleFormData>({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    applyTo: "all_products",
    productIds: [],
    categoryIds: [],
    enableFreeShipping: false,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isPermanent: false,
    status: "active",
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Sale name is required";
    }
    if (formData.discountValue <= 0) {
      newErrors.discountValue = "Discount value must be greater than 0";
    }
    if (
      formData.discountType === "percentage" &&
      formData.discountValue > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100";
    }
    if (!formData.isPermanent && !formData.endDate) {
      newErrors.endDate = "End date is required for non-permanent sales";
    }
    if (
      formData.applyTo === "specific_products" &&
      formData.productIds.length === 0
    ) {
      newErrors.productIds = "Please select at least one product";
    }
    if (
      formData.applyTo === "specific_categories" &&
      formData.categoryIds.length === 0
    ) {
      newErrors.categoryIds = "Please select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        show: true,
        message: "Please fix the errors in the form",
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = (await apiPost("/api/seller/sales", formData)) as any;

      if (response.success) {
        setAlert({
          show: true,
          message: "Sale created successfully!",
          variant: "success",
        });
        setTimeout(() => router.push(SELLER_ROUTES.SALES), 1500);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to create sale",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      setAlert({
        show: true,
        message: "An error occurred while creating the sale",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard requiredRole="seller">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Alert */}
        {alert.show && (
          <div className="mb-6">
            <UnifiedAlert
              variant={alert.variant}
              onClose={() => setAlert({ ...alert, show: false })}
            >
              {alert.message}
            </UnifiedAlert>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={SELLER_ROUTES.SALES}>
              <UnifiedButton variant="outline" size="sm" icon={<ArrowLeft />}>
                Back
              </UnifiedButton>
            </Link>
            <h1 className="text-3xl font-bold text-text">Create New Sale</h1>
          </div>
          <p className="text-textSecondary">
            Create a sale to apply discounts across multiple products
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <UnifiedCard>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h2 className="text-xl font-semibold text-text mb-4">
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Sale Name <span className="text-error">*</span>
                      </label>
                      <UnifiedInput
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g., End of Season Sale"
                        error={!!errors.name}
                      />
                      {errors.name && (
                        <p className="text-xs text-error mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Description
                      </label>
                      <UnifiedTextarea
                        value={formData.description}
                        onChange={(e) =>
                          handleChange("description", e.target.value)
                        }
                        placeholder="Describe this sale..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Status
                      </label>
                      <UnifiedSelect
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="scheduled">Scheduled</option>
                      </UnifiedSelect>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Discount Settings */}
                <div>
                  <h2 className="text-xl font-semibold text-text mb-4">
                    Discount Settings
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Discount Type <span className="text-error">*</span>
                        </label>
                        <UnifiedSelect
                          value={formData.discountType}
                          onChange={(e) =>
                            handleChange("discountType", e.target.value)
                          }
                        >
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount Off</option>
                        </UnifiedSelect>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Discount Value <span className="text-error">*</span>
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) =>
                            handleChange(
                              "discountValue",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder={
                            formData.discountType === "percentage"
                              ? "10"
                              : "100"
                          }
                          error={!!errors.discountValue}
                        />
                        {errors.discountValue && (
                          <p className="text-xs text-error mt-1">
                            {errors.discountValue}
                          </p>
                        )}
                        <p className="text-xs text-textSecondary mt-1">
                          {formData.discountType === "percentage"
                            ? "Enter percentage (e.g., 20 for 20% off)"
                            : "Enter amount in ₹ (e.g., 100 for ₹100 off)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UnifiedSwitch
                        checked={formData.enableFreeShipping}
                        onChange={(checked) =>
                          handleChange("enableFreeShipping", checked)
                        }
                      />
                      <label className="text-sm text-text">
                        Enable free shipping for this sale
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Apply To */}
                <div>
                  <h2 className="text-xl font-semibold text-text mb-4">
                    Apply Sale To
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Select Products/Categories
                      </label>
                      <UnifiedSelect
                        value={formData.applyTo}
                        onChange={(e) =>
                          handleChange("applyTo", e.target.value)
                        }
                      >
                        <option value="all_products">All Products</option>
                        <option value="specific_products">
                          Specific Products
                        </option>
                        <option value="specific_categories">
                          Specific Categories
                        </option>
                      </UnifiedSelect>
                    </div>

                    {formData.applyTo === "specific_products" && (
                      <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-text">
                          <p className="font-medium mb-1">Product Selection</p>
                          <p className="text-textSecondary">
                            Product selection feature will be available in the
                            next update. For now, the sale will apply to all
                            products.
                          </p>
                        </div>
                      </div>
                    )}

                    {formData.applyTo === "specific_categories" && (
                      <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-text">
                          <p className="font-medium mb-1">Category Selection</p>
                          <p className="text-textSecondary">
                            Category selection feature will be available in the
                            next update. For now, the sale will apply to all
                            products.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Sale Period */}
                <div>
                  <h2 className="text-xl font-semibold text-text mb-4">
                    Sale Period
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Start Date
                        </label>
                        <UnifiedInput
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleChange("startDate", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          End Date{" "}
                          {!formData.isPermanent && (
                            <span className="text-error">*</span>
                          )}
                        </label>
                        <UnifiedInput
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            handleChange("endDate", e.target.value)
                          }
                          disabled={formData.isPermanent}
                          error={!!errors.endDate}
                        />
                        {errors.endDate && (
                          <p className="text-xs text-error mt-1">
                            {errors.endDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UnifiedSwitch
                        checked={formData.isPermanent}
                        onChange={(checked) =>
                          handleChange("isPermanent", checked)
                        }
                      />
                      <label className="text-sm text-text">
                        This sale never expires (permanent sale)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-text">
                    <p className="font-medium mb-1">About Sales</p>
                    <ul className="text-textSecondary space-y-1 list-disc list-inside">
                      <li>
                        Sales are automatically applied to eligible products
                      </li>
                      <li>Only one sale discount can be applied per product</li>
                      <li>
                        Customers can still use coupons on top of sale prices
                      </li>
                      <li>Sale prices are displayed on product pages</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Link href={SELLER_ROUTES.SALES}>
                  <UnifiedButton variant="outline" disabled={loading}>
                    Cancel
                  </UnifiedButton>
                </Link>
                <UnifiedButton
                  type="submit"
                  variant="primary"
                  icon={<Save />}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Sale"}
                </UnifiedButton>
              </div>
            </CardContent>
          </UnifiedCard>
        </form>
      </div>
    </RoleGuard>
  );
}
