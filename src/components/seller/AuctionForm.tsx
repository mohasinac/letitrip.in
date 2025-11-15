"use client";

import { useState, useEffect } from "react";
import { Loader2, ImagePlus, X, Video } from "lucide-react";
import DateTimePicker from "@/components/common/DateTimePicker";
import SlugInput from "@/components/common/SlugInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import type { ProductAuctionFormFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { auctionsService } from "@/services/auctions.service";

interface AuctionFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ProductAuctionFormFE>;
  shopId?: string;
  onSubmit: (data: ProductAuctionFormFE) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: { value: AuctionStatus; label: string }[] = [
  { value: AuctionStatus.DRAFT, label: "Draft" },
  { value: AuctionStatus.SCHEDULED, label: "Scheduled" },
  { value: AuctionStatus.ACTIVE, label: "Active" },
  { value: AuctionStatus.ENDED, label: "Ended" },
  { value: AuctionStatus.CANCELLED, label: "Cancelled" },
];

export default function AuctionForm({
  mode,
  initialData,
  shopId,
  onSubmit,
  isSubmitting = false,
}: AuctionFormProps) {
  const [formData, setFormData] = useState({
    shopId: initialData?.shopId || shopId || "",
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    startingBid: initialData?.startingBid || 0,
    reservePrice: initialData?.reservePrice || 0,
    startTime: initialData?.startTime || new Date(),
    endTime:
      initialData?.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: (initialData?.status as AuctionStatus) || AuctionStatus.DRAFT,
    images: initialData?.images || [],
    videos: initialData?.videos || [],
  });

  const [slugError, setSlugError] = useState("");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);
  const [isManualSlug, setIsManualSlug] = useState(false);

  // Validate slug uniqueness
  const validateSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugError("");
      return;
    }

    // Only validate in create mode or if slug changed in edit mode
    if (mode === "edit" && slug === initialData?.slug) {
      setSlugError("");
      return;
    }

    setIsValidatingSlug(true);
    setSlugError("");

    try {
      const data = await auctionsService.validateSlug(slug, formData.shopId);

      if (!data.available) {
        setSlugError("This URL is already taken");
      }
    } catch (error) {
      console.error("Error validating slug:", error);
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (slugError) {
      alert("Please fix the errors before submitting");
      return;
    }

    if (!formData.shopId) {
      alert("Please select a shop");
      return;
    }

    if (!formData.name || !formData.slug) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.startingBid <= 0) {
      alert("Starting bid must be greater than 0");
      return;
    }

    if (formData.reservePrice && formData.reservePrice < formData.startingBid) {
      alert("Reserve price must be greater than or equal to starting bid");
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      alert("End time must be after start time");
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Basic Information
        </h2>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auction Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., Vintage Watch Collection"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Auction URL <span className="text-red-500">*</span>
            </label>
            <SlugInput
              sourceText={formData.name}
              value={formData.slug}
              onChange={(slug: string) => {
                handleChange("slug", slug);
                validateSlug(slug);
              }}
              prefix="auctions/"
              error={slugError}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => handleChange("description", value)}
              placeholder="Describe the auction item in detail..."
            />
          </div>
        </div>
      </div>

      {/* Bidding Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Bidding Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Starting Bid */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Starting Bid (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.startingBid}
              onChange={(e) =>
                handleChange("startingBid", parseFloat(e.target.value))
              }
              required
              min="1"
              step="1"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Reserve Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reserve Price (₹)
            </label>
            <input
              type="number"
              value={formData.reservePrice}
              onChange={(e) =>
                handleChange("reservePrice", parseFloat(e.target.value) || 0)
              }
              min="0"
              step="1"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum price for the item to be sold (optional)
            </p>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Auction Timing
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              value={formData.startTime}
              onChange={(date) => handleChange("startTime", date)}
              minDate={new Date()}
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time <span className="text-red-500">*</span>
            </label>
            <DateTimePicker
              value={formData.endTime}
              onChange={(date) => handleChange("endTime", date)}
              minDate={new Date(formData.startTime)}
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Media</h2>
        <div className="space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (URLs, comma-separated)
            </label>
            <textarea
              value={formData.images.join(", ")}
              onChange={(e) =>
                handleChange(
                  "images",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter image URLs separated by commas (max 10)
            </p>
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Videos (URLs, comma-separated)
            </label>
            <textarea
              value={(formData.videos || []).join(", ")}
              onChange={(e) =>
                handleChange(
                  "videos",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com/video1.mp4"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter video URLs separated by commas (optional, max 3)
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Status</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Auction Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              handleChange("status", e.target.value as AuctionStatus)
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.status === AuctionStatus.DRAFT &&
              "Draft auctions are not visible to buyers"}
            {formData.status === AuctionStatus.SCHEDULED &&
              "Auction will go live at the scheduled start time"}
            {formData.status === AuctionStatus.ACTIVE &&
              "Auction is currently accepting bids"}
            {formData.status === AuctionStatus.ENDED && "Auction has ended"}
            {formData.status === AuctionStatus.CANCELLED &&
              "Auction has been cancelled"}
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!slugError || isValidatingSlug}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Auction" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
