/**
 * @fileoverview React Component
 * @module src/app/seller/auctions/create/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { WizardActionBar } from "@/components/forms/WizardActionBar";
import { WizardSteps } from "@/components/forms/WizardSteps";
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
import { toastCrud, toastErr } from "@/lib/toast-helper";
import { toast } from "sonner";

// Step definitions - Simplified 2-step wizard
/**
 * STEPS constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for steps
 */
const STEPS = [
  {
    /** Id */
    id: "required",
    /** Name */
    name: "Required Info",
    /** Description */
    description: "Essential auction details",
  },
  {
    /** Id */
    id: "optional",
    /** Name */
    name: "Additional Details",
    /** Description */
    description: "Optional settings",
  },
];

const AUCTION_TYPES = [
  {
    /** Value */
    value: "standard",
    /** Label */
    label: "Standard Auction",
    /** Description */
    description: "Traditional highest bid wins",
  },
  {
    /** Value */
    value: "reserve",
    /** Label */
    label: "Reserve Auction",
    /** Description */
    description: "Minimum price must be met",
  },
  {
    /** Value */
    value: "buyNow",
    /** Label */
    label: "Auction with Buy Now",
    /** Description */
    description: "Bidders can buy immediately",
  },
];

export default /**
 * Creates auction wizard page
 *
 * @returns {any} The createauctionwizardpage result
 *
 */
function CreateAuctionWizardPage() {
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
    /** Bidding */
    bidding: false,
    /** Schedule */
    schedule: false,
    /** Shipping */
    shipping: false,
  });

  /**
   * Performs toggle section operation
   *
   * @param {string} section - The section
   *
   * @returns {string} The togglesection result
   */

  /**
   * Performs toggle section operation
   *
   * @param {string} section - The section
   *
   * @returns {string} The togglesection result
   */

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Form data
  const [formData, setFormData] = useState<AuctionFormData>({
    // Step 1: Basic Info
    /** Title */
    title: "",
    /** Slug */
    slug: "",
    /** Shop Id */
    shopId: "",
    /** Category */
    category: "",
    /** Auction Type */
    auctionType: "standard",
    /** Description */
    description: "",
    /** Condition */
    condition: "new",
    /** Images */
    images: [],
    /** Videos */
    videos: [],

    // Step 2: Bidding Rules
    /** Starting Bid */
    startingBid: "",
    /** Reserve Price */
    reservePrice: "",
    /** Bid Increment */
    bidIncrement: "100",
    /** Buy Now Price */
    buyNowPrice: "",

    // Schedule
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
    /** Auto Extend Minutes */
    autoExtendMinutes: "5",

    // Terms & Publishing
    /** Shipping Terms */
    shippingTerms: "",
    /** Return Policy */
    returnPolicy: "no-returns",
    /** Status */
    status: "scheduled",
    /** Featured */
    featured: false,
  });

  // Load categories
  useEffect(() => {
    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

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
  /**
   * Performs async operation
   *
   * @param {string} slug - URL-friendly identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} slug - URL-friendly identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
        /** Component */
        component: "AuctionCreate.validateSlug",
        /** Metadata */
        metadata: { slug },
      });
    } finally {
      setIsValidatingSlug(false);
    }
  };

  /**
   * Handles change event
   *
   * @param {string} field - The field
   * @param {unknown} value - The value
   *
   * @returns {string} The handlechange result
   */

  /**
   * Handles change event
   *
   * @param {string} field - The field
   * @param {unknown} value - The value
   *
   * @returns {string} The handlechange result
   */

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev: AuctionFormData) => ({ ...prev, [field]: value }));
  };

  /**
 * Validates step
 *
 * @param {number} (step - The (step
 *
 * @returns {string[] =>} The validatestep result
 *
 */
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
        case 1: // Optional De/**
 * Handles validate
 *
 * @param {any} ( - The (
 *
 * @returns {any} The handlevalidate result
 *
 */
tails - no required fields
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
/**
 * Performs error summary operation
 *
 * @param {any} allErrors - The allerrors
 *
 * @returns {any} The errorsummary result
 *
 */

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

  /**
   * Performs next step operation
   *
   * @returns {any} The nextstep result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs next step operation
   *
   * @returns {any} The nextstep result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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

  /**
   * Performs prev step operation
   *
   * @returns {any} The prevstep result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs prev step operation
   *
   * @returns {any} The prevstep result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  /**
   * Handles step click event
   *
   * @param {number} index - The index
   *
   * @returns {number} The handlestepclick result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Handles step click event
   *
   * @param {number} index - The index
   *
   * @returns {number} The handlestepclick result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleStepClick = (index: number) => {
    setError("");
    setCurrentStep(index);
  };

  // Save as draft
  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setError("");

      const auctionData: any = {
        /** Name */
        name: formData.title,
        /** Slug */
        slug: formData.slug,
        /** Category Id */
        categoryId: formData.category,
        /** Description */
        description: formData.description,
        /** Starting Bid */
        startingBid: parseFloat(formData.startingBid) || 0,
        /** Reserve Price */
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        /** Bid Increment */
        bidIncrement: parseFloat(formData.bidIncrement),
        /** Buyout Price */
        buyoutPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : undefined,
        /** Start Time */
        startTime: formData.startTime,
        /** End Time */
        endTime: formData.endTime,
        /** Status */
        status: "draft",
        /** Images */
        images: formData.images,
        /** Videos */
        videos: formData.videos,
        /** Featured */
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

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSubmit = async () => {
    if (!handleValidate()) return;

    try {
      setIsSubmitting(true);
      setError("");

      const auctionData: any = {
        /** Name */
        name: formData.title,
        /** Slug */
        slug: formData.slug,
        /** Category Id */
        categoryId: formData.category,
        /** Description */
        description: formData.description,
        /** Starting Bid */
        startingBid: parseFloat(formData.startingBid),
        /** Reserve Price */
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        /** Bid Increment */
        bidIncrement: parseFloat(formData.bidIncrement),
        /** Buyout Price */
        buyoutPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : undefined,
        /** Start Time */
        startTime: formData.startTime,
        /** End Time */
        endTime: formData.endTime,
        /** Status */
        status: formData.status,
        /** Images */
        images: formData.images,
        /** Videos */
        videos: formData.videos,
        /** Featured */
        featured: formData.featured,
      };

      await auctionsService.create(auctionData);
      toastCrud.created("Auction");
      router.push("/seller/auctions?created=true");
    } catch (err: any) {
      logError(err as Error, { component: "AuctionCreate.createAuction" });
      setError(err.message || "Failed to create auction");
      toastErr.createFailed("Auction");
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
