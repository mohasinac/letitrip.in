"use client";

import { WizardActionBar } from "@/components/forms/WizardActionBar";
import { WizardSteps } from "@/components/forms/WizardSteps";
import {
  OptionalDetailsStep,
  RequiredInfoStep,
  type ProductFormData,
} from "@/components/seller/product-wizard";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const STEPS = [
  {
    id: "required",
    name: "Required Info",
    description: "Essential product details",
  },
  {
    id: "optional",
    name: "Additional Details",
    description: "Optional information",
  },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { isLoading: loading, execute } = useLoadingState<void>({
    onLoadError: (err) => {
      logError(err, { component: "CreateProductPage.handleSubmit" });
      toast.error("Failed to create product");
    },
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    // Basic Info
    name: "",
    slug: "",
    categoryId: "",
    brand: "",
    sku: "",

    // Pricing & Stock
    price: 0,
    compareAtPrice: 0,
    stockCount: 0,
    lowStockThreshold: 10,
    weight: 0,

    // Product Details
    description: "",
    condition: "new",
    features: [],
    specifications: {},

    // Media
    images: [],
    videos: [],

    // Shipping & Policies
    shippingClass: "standard",
    returnPolicy: "",
    warrantyInfo: "",

    // SEO & Publishing
    metaTitle: "",
    metaDescription: "",
    featured: false,
    status: "draft",

    // System fields
    shopId: "default-shop-id",
  });

  // Upload state for RequiredInfoStep
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  // Expandable sections state for OptionalDetailsStep
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    details: false,
    shipping: false,
    seo: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  // Validate a specific step
  const validateStep = useCallback(
    (stepIndex: number): string[] => {
      const errors: string[] = [];

      switch (stepIndex) {
        case 0: // Required Info - all required fields
          if (!formData.name.trim()) errors.push("Product name is required");
          if (!formData.slug.trim()) errors.push("URL slug is required");
          if (!formData.categoryId) errors.push("Category is required");
          if (!formData.sku.trim()) errors.push("SKU is required");
          if (formData.price <= 0) errors.push("Price must be greater than 0");
          if (formData.stockCount < 0) errors.push("Stock cannot be negative");
          if (formData.images.length === 0)
            errors.push("At least one image is required");
          break;
        case 1: // Optional - no required validations
          break;
      }

      return errors;
    },
    [formData]
  );

  // Validate all steps
  const handleValidate = useCallback(() => {
    const newErrorSteps: number[] = [];
    const allErrors: Record<string, string[]> = {};

    STEPS.forEach((step, index) => {
      const stepErrors = validateStep(index);
      if (stepErrors.length > 0) {
        newErrorSteps.push(index);
        allErrors[step.name] = stepErrors;
      }
    });

    setErrorSteps(newErrorSteps);

    if (Object.keys(allErrors).length === 0) {
      toast.success("All fields are valid! Ready to submit.");
      return true;
    } else {
      const errorSummary = Object.entries(allErrors)
        .map(
          ([step, errors]) =>
            `${errors.length} error${errors.length > 1 ? "s" : ""} in ${step}`
        )
        .join(", ");
      toast.error(`Please fix: ${errorSummary}`);
      return false;
    }
  }, [validateStep]);

  // Save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);

      const result = await productsService.create({
        ...formData,
        status: "draft",
        countryOfOrigin: "India",
        lowStockThreshold: 5,
        isReturnable: true,
        returnWindowDays: 7,
      } as any);

      toast.success("Draft saved successfully!");

      if (result.slug) {
        router.push(`/seller/products/${result.slug}/edit`);
      }
    } catch (error) {
      logError(error as Error, { component: "ProductCreate.saveDraft" });
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    if (!handleValidate()) {
      return;
    }

    await execute(async () => {
      const result = await productsService.create({
        ...formData,
        countryOfOrigin: "India",
        lowStockThreshold: 5,
        isReturnable: true,
        returnWindowDays: 7,
      } as any);

      toast.success("Product created successfully!");

      // Redirect to edit page with the slug
      if (result.slug) {
        router.push(`/seller/products/${result.slug}/edit`);
      } else {
        router.push("/seller/products");
      }
    });
  };

  // Check if form has minimum required fields
  const isFormValid = Boolean(
    formData.name.trim() &&
      formData.slug.trim() &&
      formData.categoryId &&
      formData.sku.trim() &&
      formData.price > 0 &&
      formData.images.length > 0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/seller/products"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Product
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add a new product to your shop
          </p>
        </div>
      </div>

      {/* Mobile-friendly Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <WizardSteps
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          errorSteps={errorSteps}
          onStepClick={handleStepClick}
          variant="numbered"
        />
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 1: Required Info */}
        {currentStep === 0 && (
          <RequiredInfoStep
            formData={formData}
            setFormData={setFormData}
            uploadingImages={uploadingImages}
            setUploadingImages={setUploadingImages}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
          />
        )}

        {/* Step 2: Optional Details */}
        {currentStep === 1 && (
          <OptionalDetailsStep
            formData={formData}
            setFormData={setFormData}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {currentStep < STEPS.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <WizardActionBar
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidate}
        onSubmit={handleSubmit}
        isSubmitting={loading}
        isSaving={isSaving}
        isValid={isFormValid}
        submitLabel="Create Product"
        showSaveDraft={true}
        showValidate={true}
      />
    </div>
  );
}
