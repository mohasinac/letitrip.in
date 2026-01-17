"use client";

import { WizardActionBar } from "@letitrip/react-library";
import { WizardSteps } from "@letitrip/react-library";
import { OptionalDetailsStep } from "@/components/seller/auction-wizard/OptionalDetailsStep";
import { RequiredInfoStep } from "@/components/seller/auction-wizard/RequiredInfoStep";
import type { AuctionFormData } from "@/components/seller/auction-wizard/types";
import { logError } from "@/lib/firebase-error-logger";
import { auctionsService } from "@/services/auctions.service";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Step definitions - Simplified 2-step wizard
const STEPS = [
  {
    id: "required",
    name: "Required Info",
    description: "Essential auction details",
  },
  {
    id: "optional",
    name: "Additional Details",
    description: "Optional settings",
  },
];

const AUCTION_TYPES = [
  {
    value: "standard",
    label: "Standard Auction",
    description: "Traditional highest bid wins",
  },
  {
    value: "reserve",
    label: "Reserve Auction",
    description: "Minimum price must be met",
  },
  {
    value: "buyNow",
    label: "Auction with Buy Now",
    description: "Bidders can buy immediately",
  },
];

export default function CreateAuctionWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [slugError, setSlugError] = useState("");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);

  // Expandable sections state for Step 2
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    bidding: false,
    schedule: false,
    shipping: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Form data
  const [formData, setFormData] = useState<AuctionFormData>({
    // Step 1: Basic Info
    title: "",
    slug: "",
    shopId: "",
    category: "",
    auctionType: "standard",
    description: "",
    condition: "new",
    images: [],
    videos: [],

    // Step 2: Bidding Rules
    startingBid: "",
    reservePrice: "",
    bidIncrement: "100",
    buyNowPrice: "",

    // Schedule
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
    autoExtendMinutes: "5",

    // Terms & Publishing
    shippingTerms: "",
    returnPolicy: "no-returns",
    status: "scheduled",
    featured: false,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.list({});
        setCategories(response.data || []);
      } catch (err) {
        logError(err as Error, { component: "AuctionCreate.loadCategories" });
      }
    };
    loadCategories();
  }, []);

  // Validate slug
  const validateSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugError("");
      return;
    }

    setIsValidatingSlug(true);
    setSlugError("");

    try {
      const data = await auctionsService.validateSlug(slug, "");
      if (!data.available) {
        setSlugError("This URL is already taken");
      }
    } catch (error) {
      logError(error as Error, {
        component: "AuctionCreate.validateSlug",
        metadata: { slug },
      });
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev: AuctionFormData) => ({ ...prev, [field]: value }));
  };

  const validateStep = useCallback(
    (step: number): string[] => {
      const errors: string[] = [];
      switch (step) {
        case 0: // Required Info
          if (!formData.title.trim()) errors.push("Title is required");
          if (!formData.slug.trim()) errors.push("URL slug is required");
          if (slugError) errors.push("Please fix the URL error");
          if (!formData.category) errors.push("Category is required");
          if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
            errors.push("Starting bid must be greater than 0");
          }
          if (formData.endTime <= formData.startTime) {
            errors.push("End time must be after start time");
          }
          const duration =
            (formData.endTime.getTime() - formData.startTime.getTime()) /
            (1000 * 60 * 60);
          if (duration < 1) {
            errors.push("Auction must run for at least 1 hour");
          }
          if (formData.images.length === 0) {
            errors.push("At least one image is required");
          }
          break;
        case 1: // Optional Details - no required fields
          break;
      }
      return errors;
    },
    [formData, slugError]
  );

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
    setError("");

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

  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length === 0) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      setError("");
    } else {
      setError(stepErrors[0]);
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index: number) => {
    setError("");
    setCurrentStep(index);
  };

  // Save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setError("");

      const auctionData: any = {
        name: formData.title,
        slug: formData.slug,
        categoryId: formData.category,
        description: formData.description,
        startingBid: parseFloat(formData.startingBid) || 0,
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        bidIncrement: parseFloat(formData.bidIncrement),
        buyoutPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: "draft",
        images: formData.images,
        videos: formData.videos,
        featured: formData.featured,
      };

      await auctionsService.create(auctionData);
      toast.success("Draft saved successfully!");
      router.push("/seller/auctions");
    } catch (err: any) {
      logError(err as Error, { component: "AuctionCreate.saveDraft" });
      setError(err.message || "Failed to save draft");
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!handleValidate()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const auctionData: any = {
        name: formData.title,
        slug: formData.slug,
        categoryId: formData.category,
        description: formData.description,
        startingBid: parseFloat(formData.startingBid),
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        bidIncrement: parseFloat(formData.bidIncrement),
        buyoutPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
        images: formData.images,
        videos: formData.videos,
        featured: formData.featured,
      };

      await auctionsService.create(auctionData);
      toast.success("Auction created successfully!");
      router.push("/seller/auctions?created=true");
    } catch (err: any) {
      logError(err as Error, { component: "AuctionCreate.createAuction" });
      setError(err.message || "Failed to create auction");
      toast.error("Failed to create auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form has minimum required fields
  const isFormValid = Boolean(
    formData.title.trim() &&
      formData.slug.trim() &&
      formData.category &&
      parseFloat(formData.startingBid) > 0 &&
      formData.images.length > 0
  );

  const duration =
    formData.endTime && formData.startTime
      ? Math.round(
          ((formData.endTime.getTime() - formData.startTime.getTime()) /
            (1000 * 60 * 60 * 24)) *
            10
        ) / 10
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* Header */}
      <div>
        <Link
          href="/seller/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Create New Auction
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].name}
        </p>
      </div>

      {/* Mobile-friendly Progress Steps */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
        <WizardSteps
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          errorSteps={errorSteps}
          onStepClick={handleStepClick}
          variant="numbered"
        />
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
        {/* Step 1: Required Info */}
        {currentStep === 0 && (
          <RequiredInfoStep
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            auctionTypes={AUCTION_TYPES}
            slugError={slugError}
            setSlugError={setSlugError}
            isValidatingSlug={isValidatingSlug}
            validateSlug={validateSlug}
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
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < STEPS.length - 1 && (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Sticky Action Bar */}
      <WizardActionBar
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidate}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSaving={isSaving}
        isValid={isFormValid}
        submitLabel="Create Auction"
        showSaveDraft={true}
        showValidate={true}
      />
    </div>
  );
}
