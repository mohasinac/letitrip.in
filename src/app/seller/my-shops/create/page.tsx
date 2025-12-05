"use client";

import { WizardActionBar } from "@/components/forms/WizardActionBar";
import BasicInfoStep from "@/components/seller/shop-wizard/BasicInfoStep";
import BrandingStep from "@/components/seller/shop-wizard/BrandingStep";
import ContactLegalStep from "@/components/seller/shop-wizard/ContactLegalStep";
import PoliciesStep from "@/components/seller/shop-wizard/PoliciesStep";
import SettingsStep from "@/components/seller/shop-wizard/SettingsStep";
import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import {
  ArrowLeft,
  Check,
  FileText,
  Info,
  Palette,
  Phone,
  Settings,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateShopWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [error, setError] = useState("");

  const STEPS = [
    { id: 1, name: "Basic Info", icon: Store },
    { id: 2, name: "Branding", icon: Palette },
    { id: 3, name: "Contact & Legal", icon: Phone },
    { id: 4, name: "Policies", icon: FileText },
    { id: 5, name: "Settings", icon: Settings },
    { id: 6, name: "Review & Publish", icon: Check },
  ] as const;

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    slug: "",
    category: "",
    description: "",

    // Step 2: Branding
    logoUrl: "",
    bannerUrl: "",
    themeColor: "#3B82F6",
    accentColor: "#10B981",

    // Step 3: Contact & Legal
    email: "",
    phone: "",
    location: "",
    address: "",
    businessRegistration: "",
    taxId: "",

    // Step 4: Policies
    shippingPolicy: "",
    returnPolicy: "7-days",
    termsAndConditions: "",

    // Step 5: Settings
    defaultShippingFee: undefined as number | undefined,
    supportEmail: "",
    enableCOD: false,
    enableReturns: true,
    showContact: true,

    // Step 6: Review & Publish
    isActive: false,
    acceptsOrders: true,
  });

  // Validate slug format
  const validateSlug = (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugError("");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    } else {
      setSlugError("");
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 3) {
          setError("Shop name must be at least 3 characters");
          return false;
        }
        if (!formData.slug.trim()) {
          setError("URL slug is required");
          return false;
        }
        if (slugError) {
          setError("Please fix the URL error");
          return false;
        }
        if (!formData.description.trim() || formData.description.length < 20) {
          setError("Description must be at least 20 characters");
          return false;
        }
        break;
      case 3:
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Invalid email format");
          return false;
        }
        if (!formData.phone.trim()) {
          setError("Phone number is required");
          return false;
        }
        if (!formData.location.trim()) {
          setError("Location is required");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);
      setError("");

      const shopData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        address: formData.address,
        logoUrl: formData.logoUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
        themeColor: formData.themeColor,
        businessRegistration: formData.businessRegistration || undefined,
        taxId: formData.taxId || undefined,
        shippingPolicy: formData.shippingPolicy || undefined,
        returnPolicy: formData.returnPolicy,
        termsAndConditions: formData.termsAndConditions || undefined,
        isActive: formData.isActive,
      };

      const newShop = await shopsService.create(shopData);
      router.push(`/seller/my-shops?created=true`);
    } catch (err: any) {
      logError(err as Error, {
        component: "ShopCreate.handleSubmit",
        metadata: { shopData: formData },
      });
      setError(err.message || "Failed to create shop");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/seller/my-shops"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Shops
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Create New Shop
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Progress Bar */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium text-gray-700 sm:block">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-12 transition-colors sm:w-20 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <BasicInfoStep
                formData={formData as any}
                onChange={(field: string, value: any) =>
                  handleChange(field, value)
                }
              />
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <BrandingStep
                formData={formData as any}
                onChange={(field: string, value: any) =>
                  handleChange(field, value)
                }
                errors={{}}
              />
            </div>
          )}

          {/* Step 3: Contact & Legal */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <ContactLegalStep
                formData={formData as any}
                onChange={(field: string, value: any) =>
                  handleChange(field, value)
                }
                errors={{}}
              />
            </div>
          )}

          {/* Step 4: Policies */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <PoliciesStep
                formData={formData as any}
                onChange={(field: string, value: any) =>
                  handleChange(field, value)
                }
                errors={{}}
              />
            </div>
          )}

          {/* Step 5: Settings */}
          {currentStep === 5 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <SettingsStep
                formData={formData as any}
                onChange={(field: string, value: any) =>
                  handleChange(field, value)
                }
                errors={{}}
              />
            </div>
          )}

          {/* Step 6: Review & Publish */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review & Publish
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Review your shop details and choose publishing options
                </p>
              </div>

              {/* Shop Summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Shop Summary</h3>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-600">Shop Name:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">URL:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      /shops/{formData.slug || "your-shop"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.email || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.location || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Return Policy:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.returnPolicy
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Publishing Options */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    <span className="font-medium text-gray-900">
                      Activate shop immediately
                    </span>
                    <p className="text-gray-600">
                      Make your shop visible to customers right away
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptsOrders"
                    checked={formData.acceptsOrders}
                    onChange={(e) =>
                      handleChange("acceptsOrders", e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="acceptsOrders" className="text-sm">
                    <span className="font-medium text-gray-900">
                      Accept orders
                    </span>
                    <p className="text-gray-600">
                      Allow customers to place orders from your shop
                    </p>
                  </label>
                </div>
              </div>

              {/* Next Steps */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  📝 After Creating Your Shop
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add products to your shop catalog</li>
                  <li>• Set up payment methods</li>
                  <li>• Configure shipping options</li>
                  <li>• Submit for shop verification (if required)</li>
                  <li>• Share your shop URL with customers</li>
                </ul>
              </div>

              {/* Warning */}
              {!formData.isActive && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your shop will be created as inactive. You can activate
                    it later from your shop settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Action Bar */}
        <WizardActionBar
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Shop"
          showSaveDraft={false}
          showValidate={false}
        />
      </div>
    </div>
  );
}
