"use client";

import { PageState } from "@/components/common/PageState";
import { WizardActionBar } from "@/components/forms/WizardActionBar";
import { WizardSteps } from "@/components/forms/WizardSteps";
import {
  BasicInfoStep,
  DetailsStep,
  InventoryStep,
  ReviewStep,
  type ProductEditFormData,
} from "@/components/seller/product-edit-wizard";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { productsService } from "@/services/products.service";
import type { ProductFE } from "@/types/frontend/product.types";
import { ProductCondition, ProductStatus } from "@/types/shared/common.types";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STEPS = [
  { id: "basic", name: "Basic Info", description: "Name, price, and category" },
  {
    id: "details",
    name: "Details",
    description: "Description and specifications",
  },
  { id: "inventory", name: "Inventory", description: "Stock and SKU" },
  { id: "review", name: "Save Changes", description: "Review and update" },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductFE | null>(null);
  const [formData, setFormData] = useState<ProductEditFormData>({
    name: "",
    slug: "",
    price: 0,
    categoryId: "",
    description: "",
    stockCount: 0,
    sku: "",
    condition: "new" as ProductCondition,
    status: "draft" as ProductStatus,
  });

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  const loadProduct = useCallback(async () => {
    await execute(async () => {
      const data = await productsService.getBySlug(slug);
      setProduct(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        price: data.price,
        categoryId: data.categoryId,
        description: data.description || "",
        stockCount: data.stockCount,
        sku: data.sku || "",
        condition: (data.condition || "new") as ProductCondition,
        status: data.status as ProductStatus,
      });
    });
  }, [slug, execute]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await productsService.update(slug, formData);
      router.push("/seller/products");
    } catch (error) {
      logError(error as Error, {
        component: "SellerProductEdit.handleSubmit",
        slug,
      });
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <PageState.Error
        message={error.message}
        onRetry={loadProduct}
        fullPage={false}
      />
    );
  }

  if (isLoading) {
    return <PageState.Loading fullPage={false} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/seller/products"
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Update product information
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <WizardSteps
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={[]}
          errorSteps={[]}
          onStepClick={(i) => setCurrentStep(i)}
          variant="numbered"
        />
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <BasicInfoStep formData={formData} setFormData={setFormData} />
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <DetailsStep formData={formData} setFormData={setFormData} />
        )}

        {/* Step 3: Inventory */}
        {currentStep === 2 && (
          <InventoryStep formData={formData} setFormData={setFormData} />
        )}

        {/* Step 4: Save Changes */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Ready to Save
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Click the button below to save your changes.
              </p>
            </div>
            <ReviewStep formData={formData} setFormData={setFormData} />
          </div>
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

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <WizardActionBar
        onSaveDraft={undefined}
        onValidate={undefined}
        onSubmit={handleSubmit}
        isSubmitting={saving}
        isSaving={false}
        isValid={true}
        submitLabel="Save Changes"
        showSaveDraft={false}
        showValidate={false}
      />
    </div>
  );
}
