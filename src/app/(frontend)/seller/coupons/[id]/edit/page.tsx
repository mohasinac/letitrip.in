"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Info,
  Shuffle,
  Loader2,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiGet, apiPut } from "@/lib/api/seller";
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

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params?.id as string;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    {
      label: "Edit Coupon",
      href: SELLER_ROUTES.COUPONS_EDIT(couponId),
      active: true,
    },
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

  useEffect(() => {
    fetchCoupon();
  }, [couponId]);

  const fetchCoupon = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(`/api/seller/coupons/${couponId}`);

      if (response.success && response.data) {
        const coupon = response.data;
        setFormData({
          code: coupon.code || "",
          name: coupon.name || "",
          description: coupon.description || "",
          type: coupon.type || "percentage",
          value: coupon.value || 0,
          minimumAmount: coupon.minimumAmount || 0,
          maximumAmount: coupon.maximumAmount || 0,
          maxUses: coupon.maxUses || 0,
          maxUsesPerUser: coupon.maxUsesPerUser || 0,
          startDate: coupon.startDate
            ? new Date(coupon.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          endDate: coupon.endDate
            ? new Date(coupon.endDate).toISOString().split("T")[0]
            : "",
          isPermanent: coupon.isPermanent || false,
          status: coupon.status || "active",
          applicableProducts: coupon.applicableProducts || [],
          applicableCategories: coupon.applicableCategories || [],
          excludeProducts: coupon.excludeProducts || [],
          excludeCategories: coupon.excludeCategories || [],
          restrictions: {
            firstTimeOnly: coupon.restrictions?.firstTimeOnly || false,
            newCustomersOnly: coupon.restrictions?.newCustomersOnly || false,
            existingCustomersOnly:
              coupon.restrictions?.existingCustomersOnly || false,
            minQuantity: coupon.restrictions?.minQuantity || 0,
            maxQuantity: coupon.restrictions?.maxQuantity || 0,
            allowedPaymentMethods:
              coupon.restrictions?.allowedPaymentMethods || [],
            allowedUserEmails: coupon.restrictions?.allowedUserEmails || [],
            excludedUserEmails: coupon.restrictions?.excludedUserEmails || [],
          },
          combinable: coupon.combinable || false,
          priority: coupon.priority || 0,
          advancedConfig: {
            buyQuantity: coupon.advancedConfig?.buyQuantity || 2,
            getQuantity: coupon.advancedConfig?.getQuantity || 1,
            getDiscountType: coupon.advancedConfig?.getDiscountType || "free",
            getDiscountValue: coupon.advancedConfig?.getDiscountValue || 0,
            applyToLowest: coupon.advancedConfig?.applyToLowest ?? true,
            repeatOffer: coupon.advancedConfig?.repeatOffer ?? true,
            tiers: coupon.advancedConfig?.tiers || [],
            bundleProducts: coupon.advancedConfig?.bundleProducts || [],
            bundleDiscountType:
              coupon.advancedConfig?.bundleDiscountType || "percentage",
            bundleDiscountValue:
              coupon.advancedConfig?.bundleDiscountValue || 0,
            maxDiscountAmount: coupon.advancedConfig?.maxDiscountAmount || 0,
          },
        });
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to load coupon",
          variant: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching coupon:", error);
      setAlert({
        show: true,
        message: error.message || "Failed to load coupon",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAdvancedConfigChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      advancedConfig: { ...prev.advancedConfig, [field]: value },
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

  const handleRemoveEmail = (type: "allowed" | "excluded", email: string) => {
    const field =
      type === "allowed" ? "allowedUserEmails" : "excludedUserEmails";
    handleRestrictionChange(
      field,
      formData.restrictions[field].filter((e) => e !== email)
    );
  };

  const handleAddTier = () => {
    handleAdvancedConfigChange("tiers", [
      ...formData.advancedConfig.tiers,
      {
        minQuantity: 0,
        maxQuantity: 0,
        discountType: "percentage" as const,
        discountValue: 0,
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    handleAdvancedConfigChange(
      "tiers",
      formData.advancedConfig.tiers.filter((_, i) => i !== index)
    );
  };

  const handleTierChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newTiers = [...formData.advancedConfig.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    handleAdvancedConfigChange("tiers", newTiers);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Coupon name is required";
    }
    if (
      formData.type !== "free_shipping" &&
      formData.type !== "bogo" &&
      formData.value <= 0
    ) {
      newErrors.value = "Discount value must be greater than 0";
    }
    if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100";
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
      setSaving(true);
      const response = (await apiPut(
        `/api/seller/coupons/${couponId}`,
        formData
      )) as any;

      if (response.success) {
        setAlert({
          show: true,
          message: "Coupon updated successfully!",
          variant: "success",
        });
        setTimeout(() => router.push(SELLER_ROUTES.COUPONS), 1500);
      } else {
        setAlert({
          show: true,
          message: response.error || "Failed to update coupon",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      setAlert({
        show: true,
        message: "An error occurred while updating the coupon",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { label: "Basic Info", icon: Info },
    { label: "Discount", icon: Shuffle },
    { label: "Restrictions", icon: Info },
    { label: "Advanced", icon: Info },
  ];

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </RoleGuard>
    );
  }

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
            <Link href={SELLER_ROUTES.COUPONS}>
              <UnifiedButton variant="outline" size="sm" icon={<ArrowLeft />}>
                Back
              </UnifiedButton>
            </Link>
            <h1 className="text-3xl font-bold text-text">Edit Coupon</h1>
          </div>
          <p className="text-textSecondary">
            Update coupon settings and discount rules
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "px-4 py-2 font-medium text-sm transition-colors border-b-2",
                  activeTab === index
                    ? "text-primary border-primary"
                    : "text-textSecondary border-transparent hover:text-text"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <UnifiedCard>
            <CardContent>
              {/* Tab 0: Basic Info */}
              {activeTab === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">
                      Basic Information
                    </h2>

                    <div className="space-y-4">
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
                          <p className="text-xs text-error mt-1">
                            {errors.code}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Display Name <span className="text-error">*</span>
                        </label>
                        <UnifiedInput
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="e.g., Summer Sale"
                          error={!!errors.name}
                        />
                        {errors.name && (
                          <p className="text-xs text-error mt-1">
                            {errors.name}
                          </p>
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
                          placeholder="Describe this coupon..."
                          rows={3}
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
                  </div>
                </div>
              )}

              {/* Tab 1: Discount Settings */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">
                      Discount Settings
                    </h2>

                    <div className="space-y-4">
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
                          <option value="bogo">Buy One Get One (BOGO)</option>
                          <option value="buy_x_get_y_cheapest">
                            Buy X Get Y Cheapest Free
                          </option>
                          <option value="buy_x_get_y_percentage">
                            Buy X Get Y% Off
                          </option>
                          <option value="tiered_discount">
                            Tiered Discount
                          </option>
                          <option value="cart_discount">Cart Discount</option>
                        </UnifiedSelect>
                      </div>

                      {/* Percentage/Fixed Value */}
                      {(formData.type === "percentage" ||
                        formData.type === "fixed" ||
                        formData.type === "cart_discount") && (
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
                      )}

                      {/* Buy X Get Y Settings */}
                      {(formData.type === "buy_x_get_y_cheapest" ||
                        formData.type === "buy_x_get_y_percentage") && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-text mb-2">
                                Buy Quantity
                              </label>
                              <UnifiedInput
                                type="number"
                                value={formData.advancedConfig.buyQuantity}
                                onChange={(e) =>
                                  handleAdvancedConfigChange(
                                    "buyQuantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                placeholder="2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-text mb-2">
                                Get Quantity
                              </label>
                              <UnifiedInput
                                type="number"
                                value={formData.advancedConfig.getQuantity}
                                onChange={(e) =>
                                  handleAdvancedConfigChange(
                                    "getQuantity",
                                    parseInt(e.target.value)
                                  )
                                }
                                placeholder="1"
                              />
                            </div>
                          </div>

                          {formData.type === "buy_x_get_y_percentage" && (
                            <div>
                              <label className="block text-sm font-medium text-text mb-2">
                                Discount on Get Items (%)
                              </label>
                              <UnifiedInput
                                type="number"
                                value={formData.advancedConfig.getDiscountValue}
                                onChange={(e) =>
                                  handleAdvancedConfigChange(
                                    "getDiscountValue",
                                    parseFloat(e.target.value)
                                  )
                                }
                                placeholder="50"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <UnifiedSwitch
                              checked={formData.advancedConfig.applyToLowest}
                              onChange={(checked) =>
                                handleAdvancedConfigChange(
                                  "applyToLowest",
                                  checked
                                )
                              }
                            />
                            <label className="text-sm text-text">
                              Apply to lowest priced items
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <UnifiedSwitch
                              checked={formData.advancedConfig.repeatOffer}
                              onChange={(checked) =>
                                handleAdvancedConfigChange(
                                  "repeatOffer",
                                  checked
                                )
                              }
                            />
                            <label className="text-sm text-text">
                              Repeat offer if cart has multiple sets
                            </label>
                          </div>
                        </>
                      )}

                      {/* Tiered Discount */}
                      {formData.type === "tiered_discount" && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-text">
                              Discount Tiers
                            </label>
                            <UnifiedButton
                              type="button"
                              variant="outline"
                              size="sm"
                              icon={<Plus />}
                              onClick={handleAddTier}
                            >
                              Add Tier
                            </UnifiedButton>
                          </div>

                          {formData.advancedConfig.tiers.map((tier, index) => (
                            <div
                              key={index}
                              className="p-4 border border-border rounded-lg mb-3"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-text">
                                  Tier {index + 1}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTier(index)}
                                  className="text-error hover:text-error/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-textSecondary mb-1">
                                    Min Quantity
                                  </label>
                                  <UnifiedInput
                                    type="number"
                                    value={tier.minQuantity}
                                    onChange={(e) =>
                                      handleTierChange(
                                        index,
                                        "minQuantity",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    placeholder="1"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-textSecondary mb-1">
                                    Max Quantity
                                  </label>
                                  <UnifiedInput
                                    type="number"
                                    value={tier.maxQuantity}
                                    onChange={(e) =>
                                      handleTierChange(
                                        index,
                                        "maxQuantity",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    placeholder="0 (∞)"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-textSecondary mb-1">
                                    Discount Type
                                  </label>
                                  <UnifiedSelect
                                    value={tier.discountType}
                                    onChange={(e) =>
                                      handleTierChange(
                                        index,
                                        "discountType",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="percentage">
                                      Percentage
                                    </option>
                                    <option value="fixed">Fixed</option>
                                  </UnifiedSelect>
                                </div>
                                <div>
                                  <label className="block text-xs text-textSecondary mb-1">
                                    Discount Value
                                  </label>
                                  <UnifiedInput
                                    type="number"
                                    value={tier.discountValue}
                                    onChange={(e) =>
                                      handleTierChange(
                                        index,
                                        "discountValue",
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    placeholder={
                                      tier.discountType === "percentage"
                                        ? "10"
                                        : "100"
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {formData.advancedConfig.tiers.length === 0 && (
                            <div className="text-center py-8 text-textSecondary text-sm">
                              No tiers added yet. Click "Add Tier" to create
                              quantity-based discounts.
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Minimum Cart Amount
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
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Restrictions */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">
                      Usage Restrictions
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Max Total Uses
                          </label>
                          <UnifiedInput
                            type="number"
                            value={formData.maxUses}
                            onChange={(e) =>
                              handleChange("maxUses", parseInt(e.target.value))
                            }
                            placeholder="0 (unlimited)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text mb-2">
                            Max Uses Per User
                          </label>
                          <UnifiedInput
                            type="number"
                            value={formData.maxUsesPerUser}
                            onChange={(e) =>
                              handleChange(
                                "maxUsesPerUser",
                                parseInt(e.target.value)
                              )
                            }
                            placeholder="0 (unlimited)"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <UnifiedSwitch
                            checked={formData.restrictions.firstTimeOnly}
                            onChange={(checked) =>
                              handleRestrictionChange("firstTimeOnly", checked)
                            }
                          />
                          <label className="text-sm text-text">
                            First-time users only
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

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Allowed Payment Methods
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.restrictions.allowedPaymentMethods.includes(
                                "cod"
                              )}
                              onChange={(e) => {
                                const methods =
                                  formData.restrictions.allowedPaymentMethods;
                                if (e.target.checked) {
                                  handleRestrictionChange(
                                    "allowedPaymentMethods",
                                    [...methods, "cod"]
                                  );
                                } else {
                                  handleRestrictionChange(
                                    "allowedPaymentMethods",
                                    methods.filter((m) => m !== "cod")
                                  );
                                }
                              }}
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label className="text-sm text-text">
                              Cash on Delivery (COD)
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.restrictions.allowedPaymentMethods.includes(
                                "prepaid"
                              )}
                              onChange={(e) => {
                                const methods =
                                  formData.restrictions.allowedPaymentMethods;
                                if (e.target.checked) {
                                  handleRestrictionChange(
                                    "allowedPaymentMethods",
                                    [...methods, "prepaid"]
                                  );
                                } else {
                                  handleRestrictionChange(
                                    "allowedPaymentMethods",
                                    methods.filter((m) => m !== "prepaid")
                                  );
                                }
                              }}
                              className="w-4 h-4 text-primary rounded"
                            />
                            <label className="text-sm text-text">
                              Prepaid (Online Payment)
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Allowed User Emails
                        </label>
                        <div className="flex gap-2 mb-2">
                          <UnifiedInput
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="user@example.com"
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
                        {formData.restrictions.allowedUserEmails.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.restrictions.allowedUserEmails.map(
                              (email) => (
                                <div
                                  key={email}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveEmail("allowed", email)
                                    }
                                    className="hover:text-error"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Advanced */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4">
                      Advanced Settings
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Priority (0-100)
                        </label>
                        <UnifiedInput
                          type="number"
                          value={formData.priority}
                          onChange={(e) =>
                            handleChange("priority", parseInt(e.target.value))
                          }
                          placeholder="0"
                        />
                        <p className="text-xs text-textSecondary mt-1">
                          Higher priority coupons are applied first when
                          multiple coupons are applicable
                        </p>
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

                      <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-text">
                          <p className="font-medium mb-1">
                            Product/Category Selector
                          </p>
                          <p className="text-textSecondary">
                            Product and category selection features will be
                            available in the next update.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <div>
                  {activeTab > 0 && (
                    <UnifiedButton
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab(activeTab - 1)}
                    >
                      Previous
                    </UnifiedButton>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link href={SELLER_ROUTES.COUPONS}>
                    <UnifiedButton variant="outline" disabled={saving}>
                      Cancel
                    </UnifiedButton>
                  </Link>

                  {activeTab < tabs.length - 1 ? (
                    <UnifiedButton
                      type="button"
                      variant="primary"
                      onClick={() => setActiveTab(activeTab + 1)}
                    >
                      Next
                    </UnifiedButton>
                  ) : (
                    <UnifiedButton
                      type="submit"
                      variant="primary"
                      icon={
                        saving ? <Loader2 className="animate-spin" /> : <Save />
                      }
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Update Coupon"}
                    </UnifiedButton>
                  )}
                </div>
              </div>
            </CardContent>
          </UnifiedCard>
        </form>
      </div>
    </RoleGuard>
  );
}
