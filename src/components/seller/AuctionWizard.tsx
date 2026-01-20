/**
 * AuctionWizard Component
 *
 * Multi-step wizard for creating and editing auctions.
 *
 * Features:
 * - 4-step non-linear navigation with step indicators
 * - Step 1: Required fields (name, description, starting bid, end time, category)
 * - Step 2: Media (1+ images required)
 * - Step 3: SEO (meta title, description, keywords - inherits from category)
 * - Step 4: Auction Settings (reserve price, bid increment, auto-extend)
 * - Inline validation with error badges
 * - Always-visible Save/Finish button
 * - Draft save functionality
 * - Mobile responsive
 *
 * @component AuctionWizard
 * @example
 * ```tsx
 * <AuctionWizard auctionId="auct-123" onComplete={() => router.push('/seller/auctions')} />
 * ```
 */

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface AuctionFormData {
  // Step 1: Basic Info
  name: string;
  slug: string;
  description: string;
  startingBid: number;
  categoryId: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "active" | "ended";

  // Step 2: Media
  images: string[];
  videos?: string[];

  // Step 3: SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Step 4: Auction Settings
  reservePrice?: number;
  bidIncrement: number;
  autoExtend: boolean;
  autoExtendMinutes: number;
  buyNowPrice?: number;
  featured: boolean;
}

interface AuctionWizardProps {
  auctionId?: string;
  onComplete: () => void;
  onCancel?: () => void;
}

const CATEGORIES = [
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion" },
  { id: "home", name: "Home & Garden" },
  { id: "collectibles", name: "Collectibles" },
  { id: "art", name: "Art" },
];

export default function AuctionWizard({
  auctionId,
  onComplete,
  onCancel,
}: AuctionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AuctionFormData>({
    name: "",
    slug: "",
    description: "",
    startingBid: 0,
    categoryId: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    images: [],
    bidIncrement: 100,
    autoExtend: false,
    autoExtendMinutes: 5,
    featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load existing auction if editing
  useEffect(() => {
    if (auctionId) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [auctionId]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!auctionId && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, auctionId]);

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Auction details",
      isComplete: !!(
        formData.name &&
        formData.description &&
        formData.startingBid &&
        formData.categoryId &&
        formData.startTime &&
        formData.endTime
      ),
    },
    {
      number: 2,
      title: "Media",
      description: "Images & videos",
      isComplete: formData.images.length > 0,
    },
    {
      number: 3,
      title: "SEO",
      description: "Meta information",
      isComplete: true, // Optional step
    },
    {
      number: 4,
      title: "Settings",
      description: "Auction settings",
      isComplete: true, // Optional step
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = "Auction name is required";
      if (!formData.description)
        newErrors.description = "Description is required";
      if (!formData.startingBid || formData.startingBid <= 0)
        newErrors.startingBid = "Valid starting bid is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.startTime) newErrors.startTime = "Start time is required";
      if (!formData.endTime) newErrors.endTime = "End time is required";

      if (formData.startTime && formData.endTime) {
        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        if (end <= start) {
          newErrors.endTime = "End time must be after start time";
        }
      }
    }

    if (step === 2) {
      if (formData.images.length === 0)
        newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
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

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!isDraft && !validateStep(1)) return;
    if (!isDraft && !validateStep(2)) return;

    setIsLoading(true);

    try {
      // TODO: Submit to API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error("Failed to save auction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImage = () => {
    const imageUrl = `/auctions/placeholder-${formData.images.length + 1}.jpg`;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {auctionId ? "Edit Auction" : "Create Auction"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete all required steps to publish your auction
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
                  <div className="hidden md:block text-left">
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
                Basic Information
              </h2>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Auction Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  placeholder="Enter auction title"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    letitrip.in/buy-auction-
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  />
                </div>
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
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  placeholder="Enter auction description"
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
                    htmlFor="startingBid"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Starting Bid (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="startingBid"
                    value={formData.startingBid || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startingBid: parseFloat(e.target.value),
                      })
                    }
                    className={`w-full px-4 py-2 border ${
                      errors.startingBid
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                    placeholder="0"
                  />
                  {errors.startingBid && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startingBid}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${
                      errors.categoryId
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${
                      errors.startTime
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={`w-full px-4 py-2 border ${
                      errors.endTime
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Auction Media
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auction Images <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upload at least one image. First image will be the main
                  auction image.
                </p>

                {errors.images && (
                  <p className="mb-4 text-sm text-red-500">{errors.images}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`Auction ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Add Image
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SEO */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                SEO & Meta Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These fields are optional. If not provided, they will be
                auto-generated from the auction title and category.
              </p>

              <div>
                <label
                  htmlFor="metaTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder={`${formData.name || "Auction"} | Bid Online`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={3}
                  value={formData.metaDescription || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder={`Bid on ${formData.name || "this item"} now...`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: 150-160 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaKeywords"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Meta Keywords
                </label>
                <input
                  type="text"
                  id="metaKeywords"
                  value={formData.metaKeywords || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separate keywords with commas
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Auction Settings */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Auction Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reservePrice"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Reserve Price (₹)
                  </label>
                  <input
                    type="number"
                    id="reservePrice"
                    value={formData.reservePrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reservePrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum price to sell. Hidden from bidders.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="bidIncrement"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Bid Increment (₹)
                  </label>
                  <input
                    type="number"
                    id="bidIncrement"
                    value={formData.bidIncrement || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bidIncrement: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="100"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum amount to raise each bid
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="buyNowPrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Buy Now Price (₹)
                </label>
                <input
                  type="number"
                  id="buyNowPrice"
                  value={formData.buyNowPrice || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      buyNowPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Allow buyers to purchase immediately at this price
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="autoExtend"
                    checked={formData.autoExtend}
                    onChange={(e) =>
                      setFormData({ ...formData, autoExtend: e.target.checked })
                    }
                    className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <label
                      htmlFor="autoExtend"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Enable Auto-Extend
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Automatically extend auction time when bids are placed
                      near the end
                    </p>
                  </div>
                </div>

                {formData.autoExtend && (
                  <div className="ml-8">
                    <label
                      htmlFor="autoExtendMinutes"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Auto-Extend Duration (minutes)
                    </label>
                    <input
                      type="number"
                      id="autoExtendMinutes"
                      value={formData.autoExtendMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoExtendMinutes: parseInt(e.target.value),
                        })
                      }
                      className="w-full md:w-48 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                      min={1}
                      max={30}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label
                    htmlFor="featured"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Feature This Auction
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Display this auction prominently on the homepage
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Save as Draft
            </button>
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
            {currentStep < 4 ? (
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
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Finish & Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
