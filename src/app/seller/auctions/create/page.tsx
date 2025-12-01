"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SlugInput from "@/components/common/SlugInput";
import DateTimePicker from "@/components/common/DateTimePicker";
import { auctionsService } from "@/services/auctions.service";
import { categoriesService } from "@/services/categories.service";
import { mediaService } from "@/services/media.service";
import { WizardSteps } from "@/components/forms/WizardSteps";
import { WizardActionBar } from "@/components/forms/WizardActionBar";
import type { CategoryFE } from "@/types/frontend/category.types";

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
  const [uploadingVideos, setUploadingVideos] = useState(false);
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
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    slug: "",
    category: "",
    auctionType: "standard",
    description: "",
    condition: "new",

    // Step 2: Bidding Rules
    startingBid: "",
    reservePrice: "",
    bidIncrement: "100",
    buyNowPrice: "",

    // Step 3: Schedule
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
    autoExtendMinutes: "5",

    // Step 4: Media
    images: [] as string[],
    videos: [] as string[],

    // Step 5: Terms & Publishing
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
        console.error("Error loading categories:", err);
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
      console.error("Error validating slug:", error);
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      console.error("Error saving draft:", err);
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
      console.error("Error creating auction:", err);
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
        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter the basic details about your auction item
              </p>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="auction-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Auction Title <span className="text-red-500">*</span>
              </label>
              <input
                id="auction-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g., Vintage Rolex Watch - Limited Edition"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Choose a clear, descriptive title that buyers will search for
              </p>
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="auction-slug"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Auction URL <span className="text-red-500">*</span>
              </label>
              <SlugInput
                id="auction-slug"
                sourceText={formData.title}
                value={formData.slug}
                onChange={(slug: string) => {
                  handleChange("slug", slug);
                  validateSlug(slug);
                }}
                prefix="auctions/"
                error={slugError}
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="auction-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="auction-category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Auction Type <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                {AUCTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange("auctionType", type.value)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      formData.auctionType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {type.label}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label
                htmlFor="auction-condition"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Item Condition <span className="text-red-500">*</span>
              </label>
              <select
                id="auction-condition"
                value={formData.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="for-parts">For Parts/Not Working</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="auction-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="auction-description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={6}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Provide detailed description including condition, history, specifications, and any defects..."
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Bidding Rules */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Bidding Rules
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Set the pricing and bidding parameters for your auction
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Starting Bid */}
              <div>
                <label
                  htmlFor="auction-starting-bid"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Starting Bid (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="auction-starting-bid"
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => handleChange("startingBid", e.target.value)}
                  min="1"
                  step="1"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="1000"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  The minimum bid required to start the auction
                </p>
              </div>

              {/* Bid Increment */}
              <div>
                <label
                  htmlFor="auction-bid-increment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bid Increment (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="auction-bid-increment"
                  type="number"
                  value={formData.bidIncrement}
                  onChange={(e) => handleChange("bidIncrement", e.target.value)}
                  min="1"
                  step="1"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="100"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Minimum amount to increase each bid
                </p>
              </div>

              {/* Reserve Price */}
              {formData.auctionType === "reserve" && (
                <div>
                  <label
                    htmlFor="auction-reserve-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Reserve Price (₹)
                  </label>
                  <input
                    id="auction-reserve-price"
                    type="number"
                    value={formData.reservePrice}
                    onChange={(e) =>
                      handleChange("reservePrice", e.target.value)
                    }
                    min="0"
                    step="1"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="5000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Minimum price for item to be sold (hidden from buyers)
                  </p>
                </div>
              )}

              {/* Buy Now Price */}
              {formData.auctionType === "buyNow" && (
                <div>
                  <label
                    htmlFor="auction-buy-now-price"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Buy Now Price (₹)
                  </label>
                  <input
                    id="auction-buy-now-price"
                    type="number"
                    value={formData.buyNowPrice}
                    onChange={(e) =>
                      handleChange("buyNowPrice", e.target.value)
                    }
                    min="0"
                    step="1"
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="10000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Price to end auction and purchase immediately
                  </p>
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            {formData.startingBid && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Pricing Summary
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    • Starting bid: ₹
                    {parseFloat(formData.startingBid).toLocaleString()}
                  </li>
                  <li>
                    • Each bid increases by: ₹
                    {parseFloat(formData.bidIncrement).toLocaleString()}
                  </li>
                  {formData.reservePrice && (
                    <li>
                      • Reserve price: ₹
                      {parseFloat(formData.reservePrice).toLocaleString()}
                    </li>
                  )}
                  {formData.buyNowPrice && (
                    <li>
                      • Buy now price: ₹
                      {parseFloat(formData.buyNowPrice).toLocaleString()}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Auction Schedule
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Set when your auction will start and end
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Start Time */}
              <div>
                <label
                  htmlFor="auction-start-time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Start Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
                  id="auction-start-time"
                  value={formData.startTime}
                  onChange={(date) => handleChange("startTime", date)}
                  minDate={new Date()}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  When bidding will begin
                </p>
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="auction-end-time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  End Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
                  id="auction-end-time"
                  value={formData.endTime}
                  onChange={(date) => handleChange("endTime", date)}
                  minDate={formData.startTime}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  When bidding will close
                </p>
              </div>
            </div>

            {/* Auto Extend */}
            <div>
              <label
                htmlFor="auction-auto-extend"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Auto-Extend Time (minutes)
              </label>
              <input
                id="auction-auto-extend"
                type="number"
                value={formData.autoExtendMinutes}
                onChange={(e) =>
                  handleChange("autoExtendMinutes", e.target.value)
                }
                min="0"
                max="30"
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Extend auction by this many minutes if bid placed in final
                moments (0 to disable)
              </p>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">
                  Auction Duration
                </h3>
                <p className="text-sm text-green-800">
                  Your auction will run for <strong>{duration} days</strong>
                  {duration < 1 && " (Less than 1 day - consider extending)"}
                  {duration >= 1 &&
                    duration <= 3 &&
                    " (Short auction - good for urgent sales)"}
                  {duration > 3 &&
                    duration <= 7 &&
                    " (Standard duration - recommended)"}
                  {duration > 7 && " (Long auction - may reduce urgency)"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Media */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Images Upload */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload Auction Images
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Drag and drop images here, or click to select files
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="auction-image-upload"
                disabled={uploadingImages}
                onChange={async (e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    if (files.length + formData.images.length > 10) {
                      toast.error("Maximum 10 images allowed");
                      return;
                    }
                    setUploadingImages(true);

                    try {
                      const uploadPromises = files.map(async (file, index) => {
                        const key = `image-${index}`;
                        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

                        const result = await mediaService.upload({
                          file,
                          context: "auction",
                        });

                        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
                        return result.url;
                      });

                      const uploadedUrls = await Promise.all(uploadPromises);
                      setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, ...uploadedUrls],
                      }));
                    } catch (error) {
                      console.error("Image upload failed:", error);
                      toast.error("Failed to upload images. Please try again.");
                    } finally {
                      setUploadingImages(false);
                      setUploadProgress({});
                    }
                  }
                }}
              />
              <label
                htmlFor="auction-image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? "Uploading..." : "Select Images"}
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB each • {formData.images.length}/10
                images
              </p>

              {/* Upload Progress */}
              {uploadingImages && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress)
                    .filter(([key]) => key.startsWith("image-"))
                    .map(([key, progress]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {progress}%
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt={`Auction ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos Upload */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Upload Auction Videos (Optional)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Add demonstration or review videos
              </p>
              <input
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                id="auction-video-upload"
                disabled={uploadingVideos}
                onChange={async (e) => {
                  if (e.target.files) {
                    const files = Array.from(e.target.files);
                    if (files.length + formData.videos.length > 3) {
                      toast.error("Maximum 3 videos allowed");
                      return;
                    }
                    setUploadingVideos(true);

                    try {
                      const uploadPromises = files.map(async (file, index) => {
                        const key = `video-${index}`;
                        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

                        const result = await mediaService.upload({
                          file,
                          context: "auction",
                        });

                        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
                        return result.url;
                      });

                      const uploadedUrls = await Promise.all(uploadPromises);
                      setFormData((prev) => ({
                        ...prev,
                        videos: [...prev.videos, ...uploadedUrls],
                      }));
                    } catch (error) {
                      console.error("Video upload failed:", error);
                      toast.error("Failed to upload videos. Please try again.");
                    } finally {
                      setUploadingVideos(false);
                      setUploadProgress({});
                    }
                  }
                }}
              />
              <label
                htmlFor="auction-video-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingVideos ? "Uploading..." : "Select Videos"}
              </label>
              <p className="mt-2 text-xs text-gray-500">
                MP4, WebM up to 100MB each • {formData.videos.length}/3 videos
              </p>

              {/* Upload Progress */}
              {uploadingVideos && (
                <div className="mt-4 space-y-2">
                  {Object.entries(uploadProgress)
                    .filter(([key]) => key.startsWith("video-"))
                    .map(([key, progress]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {progress}%
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Uploaded Videos */}
              {formData.videos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.videos.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        <video
                          src={url}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          Video {index + 1}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            videos: prev.videos.filter((_, i) => i !== index),
                          }));
                        }}
                        className="flex-shrink-0 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review & Publish */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review & Publish
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Review your auction details and publish
              </p>
            </div>

            {/* Auction Summary */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Auction Summary</h3>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-gray-600">Title:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {formData.title || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {categories.find((c) => c.id === formData.category)?.name ||
                      "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Starting Bid:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    ₹
                    {formData.startingBid
                      ? parseFloat(formData.startingBid).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Bid Increment:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    ₹{parseFloat(formData.bidIncrement).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {duration} days
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Images:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {formData.images.length} images
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Terms */}
            <div>
              <label
                htmlFor="auction-shipping-terms"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Shipping Terms
              </label>
              <textarea
                id="auction-shipping-terms"
                value={formData.shippingTerms}
                onChange={(e) => handleChange("shippingTerms", e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Describe shipping options, costs, and delivery timeframes..."
              />
            </div>

            {/* Return Policy */}
            <div>
              <label
                htmlFor="auction-return-policy"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Return Policy
              </label>
              <select
                id="auction-return-policy"
                value={formData.returnPolicy}
                onChange={(e) => handleChange("returnPolicy", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="no-returns">No Returns</option>
                <option value="7-days">7 Days Return</option>
                <option value="14-days">14 Days Return</option>
                <option value="30-days">30 Days Return</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="auction-status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Publish Status
              </label>
              <select
                id="auction-status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="draft">Draft (not visible)</option>
                <option value="scheduled">
                  Scheduled (will go live at start time)
                </option>
                <option value="live">Publish Immediately</option>
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm">
                <span className="font-medium text-gray-900">
                  Feature this auction
                </span>
                <p className="text-gray-600">
                  Show this auction on the homepage and in featured sections
                </p>
              </label>
            </div>
          </div>
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
