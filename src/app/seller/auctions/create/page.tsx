"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Gavel,
  DollarSign,
  Clock,
  Image as ImageIcon,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import SlugInput from "@/components/common/SlugInput";
import DateTimePicker from "@/components/common/DateTimePicker";
import { auctionsService } from "@/services/auctions.service";
import { categoriesService } from "@/services/categories.service";
import type { CategoryFE } from "@/types/frontend/category.types";

// Step definitions
const STEPS = [
  {
    id: 1,
    name: "Basic Info",
    icon: Gavel,
    description: "Title, category & description",
  },
  {
    id: 2,
    name: "Bidding Rules",
    icon: DollarSign,
    description: "Pricing & bid settings",
  },
  { id: 3, name: "Schedule", icon: Clock, description: "Start & end times" },
  { id: 4, name: "Media", icon: ImageIcon, description: "Images & videos" },
  {
    id: 5,
    name: "Review & Publish",
    icon: FileText,
    description: "Review & publish auction",
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<CategoryFE[]>([]);
  const [slugError, setSlugError] = useState("");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);

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
    imageInput: "",
    videoInput: "",

    // Step 5: Terms & Publishing
    shippingTerms: "",
    returnPolicy: "no-returns",
    status: "scheduled",
    isFeatured: false,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesService.list({});
        setCategories(data || []);
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError("Title is required");
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
        if (!formData.category) {
          setError("Category is required");
          return false;
        }
        break;
      case 2:
        if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
          setError("Starting bid must be greater than 0");
          return false;
        }
        if (!formData.bidIncrement || parseFloat(formData.bidIncrement) <= 0) {
          setError("Bid increment must be greater than 0");
          return false;
        }
        if (
          formData.reservePrice &&
          parseFloat(formData.reservePrice) < parseFloat(formData.startingBid)
        ) {
          setError(
            "Reserve price must be greater than or equal to starting bid"
          );
          return false;
        }
        if (
          formData.buyNowPrice &&
          parseFloat(formData.buyNowPrice) <= parseFloat(formData.startingBid)
        ) {
          setError("Buy now price must be greater than starting bid");
          return false;
        }
        break;
      case 3:
        if (formData.endTime <= formData.startTime) {
          setError("End time must be after start time");
          return false;
        }
        const duration =
          (formData.endTime.getTime() - formData.startTime.getTime()) /
          (1000 * 60 * 60);
        if (duration < 1) {
          setError("Auction must run for at least 1 hour");
          return false;
        }
        break;
      case 4:
        if (formData.images.length === 0) {
          setError("At least one image is required");
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
        isFeatured: formData.isFeatured,
      };

      await auctionsService.create(auctionData);
      router.push("/seller/auctions?created=true");
    } catch (err: any) {
      console.error("Error creating auction:", err);
      setError(err.message || "Failed to create auction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (formData.imageInput.trim() && formData.images.length < 10) {
      handleChange("images", [...formData.images, formData.imageInput.trim()]);
      handleChange("imageInput", "");
    }
  };

  const removeImage = (index: number) => {
    handleChange(
      "images",
      formData.images.filter((_, i) => i !== index)
    );
  };

  const addVideo = () => {
    if (formData.videoInput.trim() && formData.videos.length < 3) {
      handleChange("videos", [...formData.videos, formData.videoInput.trim()]);
      handleChange("videoInput", "");
    }
  };

  const removeVideo = (index: number) => {
    handleChange(
      "videos",
      formData.videos.filter((_, i) => i !== index)
    );
  };

  const duration =
    formData.endTime && formData.startTime
      ? Math.round(
          ((formData.endTime.getTime() - formData.startTime.getTime()) /
            (1000 * 60 * 60 * 24)) *
            10
        ) / 10
      : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header */}
      <div>
        <Link
          href="/seller/auctions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Auctions
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Create New Auction
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Title <span className="text-red-500">*</span>
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction URL <span className="text-red-500">*</span>
              </label>
              <SlugInput
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Condition <span className="text-red-500">*</span>
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
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
        {currentStep === 2 && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Bid (₹) <span className="text-red-500">*</span>
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Increment (₹) <span className="text-red-500">*</span>
                </label>
                <input
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price (₹)
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buy Now Price (₹)
                  </label>
                  <input
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
        {currentStep === 3 && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Extend Time (minutes)
              </label>
              <input
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
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Media Upload
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Add images and videos of your auction item
              </p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={formData.imageInput}
                  onChange={(e) => handleChange("imageInput", e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addImage())
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={
                    !formData.imageInput.trim() || formData.images.length >= 10
                  }
                  className="px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {formData.images.length}/10 images • Enter image URL and press
                Add or Enter
              </p>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg border-2 border-gray-200 bg-gray-50 overflow-hidden">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-image.png";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </button>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Videos (Optional)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={formData.videoInput}
                  onChange={(e) => handleChange("videoInput", e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addVideo())
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/video.mp4"
                />
                <button
                  type="button"
                  onClick={addVideo}
                  disabled={
                    !formData.videoInput.trim() || formData.videos.length >= 3
                  }
                  className="px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {formData.videos.length}/3 videos • Enter video URL and press
                Add or Enter
              </p>

              {formData.videos.length > 0 && (
                <div className="space-y-2">
                  {formData.videos.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="flex-shrink-0 text-red-600 hover:text-red-700"
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
        {currentStep === 5 && (
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Terms
              </label>
              <textarea
                value={formData.shippingTerms}
                onChange={(e) => handleChange("shippingTerms", e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Describe shipping options, costs, and delivery timeframes..."
              />
            </div>

            {/* Return Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Policy
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publish Status
              </label>
              <select
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
                checked={formData.isFeatured}
                onChange={(e) => handleChange("isFeatured", e.target.checked)}
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
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </button>

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isValidatingSlug}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Auction"}
          </button>
        )}
      </div>
    </div>
  );
}
