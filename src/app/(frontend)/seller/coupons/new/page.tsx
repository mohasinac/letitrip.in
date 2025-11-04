"use client";

import React, { useState } from "react";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  Shuffle,
  Gift,
  TrendingUp,
  Package,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api/seller";
import { cn } from "@/lib/utils";
import {
  UnifiedCard,
  CardContent,
  UnifiedButton,
  UnifiedInput,
  UnifiedSelect,
  UnifiedTextarea,
  UnifiedSwitch,
  UnifiedBadge,
  UnifiedAlert,
} from "@/components/ui/unified";

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type:
    | "percentage"
    | "fixed"
    | "free_shipping"
    | "bogo"
    | "cart_discount"
    | "buy_x_get_y_cheapest"
    | "buy_x_get_y_percentage"
    | "tiered_discount"
    | "bundle_discount";
  value: number;
  minimumAmount: number;
  maximumAmount: number;
  maxUses: number;
  maxUsesPerUser: number;
  startDate: string;
  endDate: string;
  isPermanent: boolean;
  status: "active" | "inactive" | "scheduled";
  applicableProducts: string[];
  applicableCategories: string[];
  excludeProducts: string[];
  excludeCategories: string[];
  restrictions: {
    firstTimeOnly: boolean;
    newCustomersOnly: boolean;
    existingCustomersOnly: boolean;
    minQuantity: number;
    maxQuantity: number;
    allowedPaymentMethods: ("cod" | "prepaid")[];
    allowedUserEmails: string[];
    excludedUserEmails: string[];
  };
  combinable: boolean;
  priority: number;
  // Advanced configuration for new coupon types
  advancedConfig: {
    buyQuantity: number;
    getQuantity: number;
    getDiscountType: "free" | "percentage" | "fixed";
    getDiscountValue: number;
    applyToLowest: boolean;
    repeatOffer: boolean;
    tiers: Array<{
      minQuantity: number;
      maxQuantity: number;
      discountType: "percentage" | "fixed";
      discountValue: number;
    }>;
    bundleProducts: Array<{
      productId: string;
      quantity: number;
    }>;
    bundleDiscountType: "percentage" | "fixed";
    bundleDiscountValue: number;
    maxDiscountAmount: number;
  };
}

export default function CreateCouponPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
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
    { label: "Coupons", href: SELLER_ROUTES.COUPONS },
    { label: "Create Coupon", href: SELLER_ROUTES.COUPONS_NEW, active: true },
  ]);

  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minimumAmount: 0,
    maximumAmount: 0,
    maxUses: 0,
    maxUsesPerUser: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isPermanent: false,
    status: "active",
    applicableProducts: [],
    applicableCategories: [],
    excludeProducts: [],
    excludeCategories: [],
    restrictions: {
      firstTimeOnly: false,
      newCustomersOnly: false,
      existingCustomersOnly: false,
      minQuantity: 0,
      maxQuantity: 0,
      allowedPaymentMethods: [],
      allowedUserEmails: [],
      excludedUserEmails: [],
    },
    combinable: false,
    priority: 0,
    advancedConfig: {
      buyQuantity: 2,
      getQuantity: 1,
      getDiscountType: "free",
      getDiscountValue: 0,
      applyToLowest: true,
      repeatOffer: true,
      tiers: [],
      bundleProducts: [],
      bundleDiscountType: "percentage",
      bundleDiscountValue: 0,
      maxDiscountAmount: 0,
    },
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

  const handleRestrictionChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      restrictions: { ...prev.restrictions, [field]: value },
    }));
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleChange("code", code);
  };

  const handleAddEmail = (type: "allowed" | "excluded") => {
    if (emailInput.trim() && emailInput.includes("@")) {
      const field =
        type === "allowed" ? "allowedUserEmails" : "excludedUserEmails";
      handleRestrictionChange(field, [
        ...formData.restrictions[field],
        emailInput.trim(),
      ]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (type: "allowed" | "excluded", index: number) => {
    const field =
      type === "allowed" ? "allowedUserEmails" : "excludedUserEmails";
    const newEmails = formData.restrictions[field].filter(
      (_, i) => i !== index
    );
    handleRestrictionChange(field, newEmails);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required";
    }
    if (formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }
    if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }
    if (!formData.isPermanent && !formData.endDate) {
      newErrors.endDate = "End date is required for non-permanent coupons";
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
      const response = (await apiPost("/api/seller/coupons", formData)) as any;

      if (response.success) {
        setAlert({
          show: true,
          message: "Coupon created successfully!",
          variant: "success",
        });
        setTimeout(() => router.push(SELLER_ROUTES.COUPONS), 1500);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to create coupon",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      setAlert({
        show: true,
        message: "An error occurred while creating the coupon",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    "Basic Info",
    "Usage Limits",
    "Restrictions",
    "Products",
    "Customers",
  ];

  return (
    <RoleGuard requiredRole="seller">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            <Link href={SELLER_ROUTES.COUPONS}>
              <UnifiedButton variant="outline" size="sm" icon={<ArrowLeft />}>
                Back
              </UnifiedButton>
            </Link>
            <h1 className="text-3xl font-bold text-text">Create New Coupon</h1>
          </div>
          <p className="text-textSecondary">
            Create a new discount coupon for your customers
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <UnifiedCard>
            <CardContent>
              {/* Tabs */}
              <div className="border-b border-border mb-6">
                <div className="flex gap-1">
                  {tabs.map((tab, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveTab(index)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-colors",
                        activeTab === index
                          ? "text-primary border-b-2 border-primary"
                          : "text-textSecondary hover:text-text"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {/* Tab 0: Basic Info */}
                {activeTab === 0 && (
                  <div className="space-y-6">
                    {/* Coupon Code */}
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Coupon Code <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        <UnifiedInput
                          value={formData.code}
                          onChange={(e) =>
                            handleChange("code", e.target.value.toUpperCase())
                          }
                          placeholder="e.g., SUMMER2024"
                          error={!!errors.code}
                          className="flex-1"
                        />
                        <UnifiedButton
                          type="button"
                          variant="outline"
                          icon={<Shuffle />}
                          onClick={generateRandomCode}
                        >
                          Generate
                        </UnifiedButton>
                      </div>
                      {errors.code && (
                        <p className="text-xs text-error mt-1">{errors.code}</p>
                      )}
                    </div>

                    {/* Name & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Coupon Name <span className="text-error">*</span>
                        </label>
                        <UnifiedInput
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="e.g., Summer Sale"
                          error={!!errors.name}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Status
                        </label>
                        <UnifiedSelect
                          value={formData.status}
                          onChange={(e) =>
                            handleChange("status", e.target.value)
                          }
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="scheduled">Scheduled</option>
                        </UnifiedSelect>
                      </div>
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
                        placeholder="Describe this coupon..."
                        rows={3}
                      />
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Discount Type <span className="text-error">*</span>
                        </label>
                        <UnifiedSelect
                          value={formData.type}
                          onChange={(e) => handleChange("type", e.target.value)}
                        >
                          <option value="percentage">Percentage Off</option>
                          <option value="fixed">Fixed Amount Off</option>
                          <option value="free_shipping">Free Shipping</option>
                          <option value="bogo">Buy One Get One</option>
                          <option value="cart_discount">Cart Discount</option>
                          <optgroup label="Advanced Offers">
                            <option value="buy_x_get_y_cheapest">
                              Buy X Get Y Cheapest Free
                            </option>
                            <option value="buy_x_get_y_percentage">
                              Buy X Get Y at Discount
                            </option>
                            <option value="tiered_discount">
                              Tiered Discount (More Items = More Discount)
                            </option>
                            <option value="bundle_discount">
                              Bundle Discount (Buy Products Together)
                            </option>
                          </optgroup>
                        </UnifiedSelect>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Discount Value <span className="text-error">*</span>
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.value}
                          onChange={(e) =>
                            handleChange("value", parseFloat(e.target.value))
                          }
                          placeholder={
                            formData.type === "percentage" ? "10" : "100"
                          }
                          error={!!errors.value}
                        />
                        {errors.value && (
                          <p className="text-xs text-error mt-1">
                            {errors.value}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Advanced Coupon Configuration - Buy X Get Y */}
                    {(formData.type === "buy_x_get_y_cheapest" ||
                      formData.type === "buy_x_get_y_percentage") && (
                      <div className="space-y-4 p-4 bg-surface/50 border-2 border-primary/20 rounded-lg">
                        <h3 className="font-semibold text-text flex items-center gap-2">
                          <Info className="w-5 h-5 text-primary" />
                          Buy X Get Y Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Buy Quantity (X){" "}
                              <span className="text-error">*</span>
                            </label>
                            <UnifiedInput
                              type="number"
                              min="1"
                              value={formData.advancedConfig.buyQuantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    buyQuantity: parseInt(e.target.value) || 1,
                                  },
                                })
                              }
                              placeholder="2"
                            />
                            <p className="text-xs text-textSecondary mt-1">
                              Customer must buy this many items
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Get Quantity (Y){" "}
                              <span className="text-error">*</span>
                            </label>
                            <UnifiedInput
                              type="number"
                              min="1"
                              value={formData.advancedConfig.getQuantity}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    getQuantity: parseInt(e.target.value) || 1,
                                  },
                                })
                              }
                              placeholder="1"
                            />
                            <p className="text-xs text-textSecondary mt-1">
                              Customer gets this many discounted
                            </p>
                          </div>
                        </div>

                        {formData.type === "buy_x_get_y_percentage" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-text mb-2">
                                Discount Type
                              </label>
                              <UnifiedSelect
                                value={formData.advancedConfig.getDiscountType}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      getDiscountType: e.target.value as
                                        | "free"
                                        | "percentage"
                                        | "fixed",
                                    },
                                  })
                                }
                              >
                                <option value="free">Free</option>
                                <option value="percentage">
                                  Percentage Off
                                </option>
                                <option value="fixed">Fixed Amount Off</option>
                              </UnifiedSelect>
                            </div>
                            {formData.advancedConfig.getDiscountType !==
                              "free" && (
                              <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                  Discount Value
                                </label>
                                <UnifiedInput
                                  type="number"
                                  min="0"
                                  value={
                                    formData.advancedConfig.getDiscountValue
                                  }
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      advancedConfig: {
                                        ...formData.advancedConfig,
                                        getDiscountValue:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    })
                                  }
                                  placeholder={
                                    formData.advancedConfig.getDiscountType ===
                                    "percentage"
                                      ? "50"
                                      : "100"
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="applyToLowest"
                              checked={formData.advancedConfig.applyToLowest}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    applyToLowest: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <label
                              htmlFor="applyToLowest"
                              className="text-sm text-text"
                            >
                              Apply to cheapest items (recommended)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="repeatOffer"
                              checked={formData.advancedConfig.repeatOffer}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    repeatOffer: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <label
                              htmlFor="repeatOffer"
                              className="text-sm text-text"
                            >
                              Repeat offer (e.g., Buy 2 Get 1 → Buy 4 Get 2)
                            </label>
                          </div>
                        </div>

                        <div className="bg-info/10 border border-info/20 rounded p-3 flex gap-2">
                          <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-textSecondary">
                            <strong>Example:</strong> Buy{" "}
                            {formData.advancedConfig.buyQuantity} Get{" "}
                            {formData.advancedConfig.getQuantity}{" "}
                            {formData.type === "buy_x_get_y_cheapest"
                              ? "Cheapest Free"
                              : formData.advancedConfig.getDiscountType ===
                                "free"
                              ? "Free"
                              : `at ${
                                  formData.advancedConfig.getDiscountValue
                                }${
                                  formData.advancedConfig.getDiscountType ===
                                  "percentage"
                                    ? "%"
                                    : "₹"
                                } off`}
                            {formData.advancedConfig.repeatOffer &&
                              " (Repeating)"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Advanced Coupon Configuration - Tiered Discount */}
                    {formData.type === "tiered_discount" && (
                      <div className="space-y-4 p-4 bg-surface/50 border-2 border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-text flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Tiered Discount Configuration
                          </h3>
                          <UnifiedButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                advancedConfig: {
                                  ...formData.advancedConfig,
                                  tiers: [
                                    ...(formData.advancedConfig.tiers || []),
                                    {
                                      minQuantity: 1,
                                      maxQuantity: 0,
                                      discountType: "percentage",
                                      discountValue: 0,
                                    },
                                  ],
                                },
                              });
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Tier
                          </UnifiedButton>
                        </div>
                        <p className="text-sm text-textSecondary">
                          Define different discount levels based on cart
                          quantity. Higher quantities get better discounts.
                        </p>

                        {formData.advancedConfig.tiers?.map((tier, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-background border border-border rounded"
                          >
                            <div>
                              <label className="block text-xs font-medium text-text mb-1">
                                Min Quantity
                              </label>
                              <UnifiedInput
                                type="number"
                                min="1"
                                value={tier.minQuantity}
                                onChange={(e) => {
                                  const newTiers = [
                                    ...(formData.advancedConfig.tiers || []),
                                  ];
                                  newTiers[index] = {
                                    ...tier,
                                    minQuantity: parseInt(e.target.value) || 1,
                                  };
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      tiers: newTiers,
                                    },
                                  });
                                }}
                                placeholder="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-text mb-1">
                                Max Quantity
                              </label>
                              <UnifiedInput
                                type="number"
                                min="0"
                                value={tier.maxQuantity}
                                onChange={(e) => {
                                  const newTiers = [
                                    ...(formData.advancedConfig.tiers || []),
                                  ];
                                  newTiers[index] = {
                                    ...tier,
                                    maxQuantity: parseInt(e.target.value) || 0,
                                  };
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      tiers: newTiers,
                                    },
                                  });
                                }}
                                placeholder="0 (∞)"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-text mb-1">
                                Type
                              </label>
                              <UnifiedSelect
                                value={tier.discountType}
                                onChange={(e) => {
                                  const newTiers = [
                                    ...(formData.advancedConfig.tiers || []),
                                  ];
                                  newTiers[index] = {
                                    ...tier,
                                    discountType: e.target.value as
                                      | "percentage"
                                      | "fixed",
                                  };
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      tiers: newTiers,
                                    },
                                  });
                                }}
                              >
                                <option value="percentage">%</option>
                                <option value="fixed">₹</option>
                              </UnifiedSelect>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-text mb-1">
                                Value
                              </label>
                              <UnifiedInput
                                type="number"
                                min="0"
                                value={tier.discountValue}
                                onChange={(e) => {
                                  const newTiers = [
                                    ...(formData.advancedConfig.tiers || []),
                                  ];
                                  newTiers[index] = {
                                    ...tier,
                                    discountValue:
                                      parseFloat(e.target.value) || 0,
                                  };
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      tiers: newTiers,
                                    },
                                  });
                                }}
                                placeholder={
                                  tier.discountType === "percentage"
                                    ? "10"
                                    : "100"
                                }
                              />
                            </div>
                            <div className="flex items-end">
                              <UnifiedButton
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newTiers =
                                    formData.advancedConfig.tiers?.filter(
                                      (_, i) => i !== index
                                    ) || [];
                                  setFormData({
                                    ...formData,
                                    advancedConfig: {
                                      ...formData.advancedConfig,
                                      tiers: newTiers,
                                    },
                                  });
                                }}
                                className="w-full"
                              >
                                <Trash2 className="w-4 h-4" />
                              </UnifiedButton>
                            </div>
                          </div>
                        ))}

                        {(!formData.advancedConfig.tiers ||
                          formData.advancedConfig.tiers.length === 0) && (
                          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                            <Package className="w-12 h-12 text-textSecondary mx-auto mb-2" />
                            <p className="text-sm text-textSecondary">
                              No tiers added yet. Click "Add Tier" to create
                              your first tier.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advanced Coupon Configuration - Bundle Discount */}
                    {formData.type === "bundle_discount" && (
                      <div className="space-y-4 p-4 bg-surface/50 border-2 border-primary/20 rounded-lg">
                        <h3 className="font-semibold text-text flex items-center gap-2">
                          <Package className="w-5 h-5 text-primary" />
                          Bundle Discount Configuration
                        </h3>
                        <p className="text-sm text-textSecondary">
                          Define specific products that must be purchased
                          together to qualify for this discount.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Discount Type
                            </label>
                            <UnifiedSelect
                              value={formData.advancedConfig.bundleDiscountType}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    bundleDiscountType: e.target.value as
                                      | "percentage"
                                      | "fixed",
                                  },
                                })
                              }
                            >
                              <option value="percentage">Percentage Off</option>
                              <option value="fixed">Fixed Amount Off</option>
                            </UnifiedSelect>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Discount Value
                            </label>
                            <UnifiedInput
                              type="number"
                              min="0"
                              value={
                                formData.advancedConfig.bundleDiscountValue
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  advancedConfig: {
                                    ...formData.advancedConfig,
                                    bundleDiscountValue:
                                      parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              placeholder={
                                formData.advancedConfig.bundleDiscountType ===
                                "percentage"
                                  ? "20"
                                  : "500"
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Bundle Products
                          </label>
                          <div className="p-4 bg-background border-2 border-dashed border-border rounded-lg text-center">
                            <Package className="w-12 h-12 text-textSecondary mx-auto mb-2" />
                            <p className="text-sm text-textSecondary mb-1">
                              Product selector coming soon
                            </p>
                            <p className="text-xs text-textSecondary">
                              Bundle products can be configured via API for now
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Min/Max Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Minimum Order Amount
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.minimumAmount}
                          onChange={(e) =>
                            handleChange(
                              "minimumAmount",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Maximum Discount Amount
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.maximumAmount}
                          onChange={(e) =>
                            handleChange(
                              "maximumAmount",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="0 (unlimited)"
                        />
                      </div>
                    </div>

                    {/* Dates */}
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
                        This coupon never expires
                      </label>
                    </div>
                  </div>
                )}

                {/* Tab 1: Usage Limits */}
                {activeTab === 1 && (
                  <div className="space-y-6">
                    <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                      <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-text">
                        <p className="font-medium mb-1">Usage Limits</p>
                        <p className="text-textSecondary">
                          Set limits on how many times this coupon can be used.
                          Leave 0 for unlimited usage.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Maximum Total Uses
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.maxUses}
                          onChange={(e) =>
                            handleChange(
                              "maxUses",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0 (unlimited)"
                        />
                        <p className="text-xs text-textSecondary mt-1">
                          Total number of times this coupon can be used across
                          all customers
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Maximum Uses Per User
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.maxUsesPerUser}
                          onChange={(e) =>
                            handleChange(
                              "maxUsesPerUser",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0 (unlimited)"
                        />
                        <p className="text-xs text-textSecondary mt-1">
                          How many times each customer can use this coupon
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Minimum Quantity
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.restrictions.minQuantity}
                          onChange={(e) =>
                            handleRestrictionChange(
                              "minQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Maximum Quantity
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.restrictions.maxQuantity}
                          onChange={(e) =>
                            handleRestrictionChange(
                              "maxQuantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0 (unlimited)"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UnifiedSwitch
                        checked={formData.combinable}
                        onChange={(checked) =>
                          handleChange("combinable", checked)
                        }
                      />
                      <label className="text-sm text-text">
                        Can be combined with other coupons
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Priority (for stackable coupons)
                      </label>
                      <UnifiedInput
                        type="number"
                        value={formData.priority}
                        onChange={(e) =>
                          handleChange(
                            "priority",
                            parseInt(e.target.value) || 1
                          )
                        }
                        placeholder="1"
                      />
                      <p className="text-xs text-textSecondary mt-1">
                        Higher priority coupons are applied first (1 = highest)
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Restrictions */}
                {activeTab === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text mb-4">
                        Customer Restrictions
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UnifiedSwitch
                            checked={formData.restrictions.firstTimeOnly}
                            onChange={(checked) =>
                              handleRestrictionChange("firstTimeOnly", checked)
                            }
                          />
                          <label className="text-sm text-text">
                            First time purchase only
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <UnifiedSwitch
                            checked={formData.restrictions.newCustomersOnly}
                            onChange={(checked) =>
                              handleRestrictionChange(
                                "newCustomersOnly",
                                checked
                              )
                            }
                          />
                          <label className="text-sm text-text">
                            New customers only
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <UnifiedSwitch
                            checked={
                              formData.restrictions.existingCustomersOnly
                            }
                            onChange={(checked) =>
                              handleRestrictionChange(
                                "existingCustomersOnly",
                                checked
                              )
                            }
                          />
                          <label className="text-sm text-text">
                            Existing customers only
                          </label>
                        </div>
                      </div>
                    </div>

                    <hr className="border-border" />

                    <div>
                      <h3 className="text-lg font-semibold text-text mb-4">
                        Payment Method Restrictions
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="cod"
                            checked={formData.restrictions.allowedPaymentMethods.includes(
                              "cod"
                            )}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [
                                    ...formData.restrictions
                                      .allowedPaymentMethods,
                                    "cod",
                                  ]
                                : formData.restrictions.allowedPaymentMethods.filter(
                                    (m) => m !== "cod"
                                  );
                              handleRestrictionChange(
                                "allowedPaymentMethods",
                                methods
                              );
                            }}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                          />
                          <label htmlFor="cod" className="text-sm text-text">
                            Cash on Delivery (COD)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="prepaid"
                            checked={formData.restrictions.allowedPaymentMethods.includes(
                              "prepaid"
                            )}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [
                                    ...formData.restrictions
                                      .allowedPaymentMethods,
                                    "prepaid",
                                  ]
                                : formData.restrictions.allowedPaymentMethods.filter(
                                    (m) => m !== "prepaid"
                                  );
                              handleRestrictionChange(
                                "allowedPaymentMethods",
                                methods
                              );
                            }}
                            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                          />
                          <label
                            htmlFor="prepaid"
                            className="text-sm text-text"
                          >
                            Prepaid (Online Payment)
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-textSecondary mt-2">
                        If none selected, coupon is valid for all payment
                        methods
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 3: Products */}
                {activeTab === 3 && (
                  <div className="space-y-6">
                    <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                      <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-text">
                        <p className="font-medium mb-1">Product Restrictions</p>
                        <p className="text-textSecondary">
                          Leave empty to apply coupon to all products. Add
                          specific products/categories to restrict usage.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Applicable Products (Coming Soon)
                      </label>
                      <p className="text-sm text-textSecondary">
                        Product selection feature will be available in the next
                        update.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Applicable Categories (Coming Soon)
                      </label>
                      <p className="text-sm text-textSecondary">
                        Category selection feature will be available in the next
                        update.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 4: Customers */}
                {activeTab === 4 && (
                  <div className="space-y-6">
                    {/* Allowed Emails */}
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Allowed Customer Emails
                      </label>
                      <div className="flex gap-2 mb-2">
                        <UnifiedInput
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="customer@example.com"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEmail("allowed");
                            }
                          }}
                        />
                        <UnifiedButton
                          type="button"
                          variant="outline"
                          icon={<Plus />}
                          onClick={() => handleAddEmail("allowed")}
                        >
                          Add
                        </UnifiedButton>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.restrictions.allowedUserEmails.map(
                          (email, index) => (
                            <UnifiedBadge
                              key={index}
                              variant="primary"
                              className="flex items-center gap-1"
                            >
                              {email}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveEmail("allowed", index)
                                }
                                className="ml-1 hover:text-error"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </UnifiedBadge>
                          )
                        )}
                      </div>
                      <p className="text-xs text-textSecondary mt-2">
                        Only these customers can use this coupon. Leave empty
                        for all customers.
                      </p>
                    </div>

                    <hr className="border-border" />

                    {/* Excluded Emails */}
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Excluded Customer Emails
                      </label>
                      <div className="flex gap-2 mb-2">
                        <UnifiedInput
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="customer@example.com"
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEmail("excluded");
                            }
                          }}
                        />
                        <UnifiedButton
                          type="button"
                          variant="outline"
                          icon={<Plus />}
                          onClick={() => handleAddEmail("excluded")}
                        >
                          Add
                        </UnifiedButton>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.restrictions.excludedUserEmails.map(
                          (email, index) => (
                            <UnifiedBadge
                              key={index}
                              variant="warning"
                              className="flex items-center gap-1"
                            >
                              {email}
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveEmail("excluded", index)
                                }
                                className="ml-1 hover:text-error"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </UnifiedBadge>
                          )
                        )}
                      </div>
                      <p className="text-xs text-textSecondary mt-2">
                        These customers cannot use this coupon.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Link href={SELLER_ROUTES.COUPONS}>
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
                  {loading ? "Creating..." : "Create Coupon"}
                </UnifiedButton>
              </div>
            </CardContent>
          </UnifiedCard>
        </form>
      </div>
    </RoleGuard>
  );
}
