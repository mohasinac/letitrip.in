"use client";

import DateTimePicker from "@/components/common/DateTimePicker";
import RichTextEditor from "@/components/common/RichTextEditor";
import SlugInput from "@/components/common/SlugInput";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { Card } from "@/components/ui/Card";
import { FormActions } from "@/components/ui/FormActions";
import { logError } from "@/lib/error-logger";
import { auctionsService } from "@/services/auctions.service";
import type { ProductAuctionFormFE } from "@/types/frontend/auction.types";
import { AuctionStatus } from "@/types/shared/common.types";
import { useState } from "react";
import { toast } from "sonner";

interface AuctionFormProps {
  mode: "create" | "edit";
  initialData?: Partial<ProductAuctionFormFE>;
  shopId?: string;
  onSubmit: (data: ProductAuctionFormFE) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = [
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
      logError(error as Error, {
        component: "AuctionForm.validateSlug",
        metadata: { slug },
      });
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (slugError) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!formData.shopId) {
      toast.error("Please select a shop");
      return;
    }

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.startingBid <= 0) {
      toast.error("Starting bid must be greater than 0");
      return;
    }

    if (formData.reservePrice && formData.reservePrice < formData.startingBid) {
      toast.error(
        "Reserve price must be greater than or equal to starting bid"
      );
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error("End time must be after start time");
      return;
    }

    // Clean images before submit
    const cleanedImages = (formData.images || [])
      .map((s) => s.trim())
      .filter(Boolean);
    // Always prefer shopId prop over initialData.shopId
    onSubmit({
      ...formData,
      shopId: shopId || formData.shopId,
      images: cleanedImages,
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className="space-y-6"
    >
      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="space-y-4">
          <FormField label="Auction Name" required>
            <FormInput
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Vintage Watch Collection"
              disabled={isSubmitting}
            />
          </FormField>

          <div id="auction-slug-wrapper">
            <FormLabel htmlFor="auction-slug-wrapper" required>
              Auction URL
            </FormLabel>
            <SlugInput
              sourceText={formData.name}
              value={formData.slug}
              onChange={(slug: string) => {
                handleChange("slug", slug);
                validateSlug(slug);
              }}
              error={slugError}
              disabled={isSubmitting}
              showPreview={true}
              allowManualEdit={true}
              baseUrl="https://letitrip.in/auctions"
            />
            {isValidatingSlug && (
              <p className="mt-1 text-xs text-gray-500">
                Checking availability...
              </p>
            )}
          </div>

          <div id="auction-description-wrapper">
            <FormLabel htmlFor="auction-description-wrapper" required>
              Description
            </FormLabel>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) => handleChange("description", value)}
              placeholder="Describe the auction item in detail..."
            />
          </div>
        </div>
      </Card>

      {/* Bidding Details */}
      <Card title="Bidding Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Starting Bid (₹)" required>
            <FormInput
              type="number"
              value={formData.startingBid}
              onChange={(e) =>
                handleChange("startingBid", parseFloat(e.target.value))
              }
              min={1}
              step={1}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Reserve Price (₹)"
            hint="Minimum price for the item to be sold (optional)"
          >
            <FormInput
              type="number"
              value={formData.reservePrice}
              onChange={(e) =>
                handleChange("reservePrice", parseFloat(e.target.value) || 0)
              }
              min={0}
              step={1}
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </Card>

      {/* Timing */}
      <Card title="Auction Timing">
        <div className="grid gap-4 sm:grid-cols-2">
          <div id="auction-start-time-wrapper">
            <FormLabel htmlFor="auction-start-time-wrapper" required>
              Start Time
            </FormLabel>
            <DateTimePicker
              value={formData.startTime}
              onChange={(date) => handleChange("startTime", date)}
              minDate={new Date()}
            />
          </div>

          <div id="auction-end-time-wrapper">
            <FormLabel htmlFor="auction-end-time-wrapper" required>
              End Time
            </FormLabel>
            <DateTimePicker
              value={formData.endTime}
              onChange={(date) => handleChange("endTime", date)}
              minDate={new Date(formData.startTime)}
            />
          </div>
        </div>
      </Card>

      {/* Media */}
      <Card title="Media">
        <div className="space-y-4">
          <FormField
            label="Images (URLs, comma-separated)"
            hint="Enter image URLs separated by commas (max 10)"
          >
            <FormTextarea
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
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Videos (URLs, comma-separated)"
            hint="Enter video URLs separated by commas (optional, max 3)"
          >
            <FormTextarea
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
              placeholder="https://example.com/video1.mp4"
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </Card>

      {/* Status */}
      <Card title="Status">
        <FormField
          label="Auction Status"
          hint={
            formData.status === AuctionStatus.DRAFT
              ? "Draft auctions are not visible to buyers"
              : formData.status === AuctionStatus.SCHEDULED
              ? "Auction will go live at the scheduled start time"
              : formData.status === AuctionStatus.ACTIVE
              ? "Auction is currently accepting bids"
              : formData.status === AuctionStatus.ENDED
              ? "Auction has ended"
              : "Auction has been cancelled"
          }
        >
          <FormSelect
            value={formData.status}
            onChange={(e) =>
              handleChange("status", e.target.value as AuctionStatus)
            }
            options={STATUS_OPTIONS}
            disabled={isSubmitting}
          />
        </FormField>
      </Card>

      {/* Submit Buttons */}
      <FormActions
        onCancel={() => globalThis.history?.back()}
        onSubmit={handleSubmit}
        submitLabel={mode === "edit" ? "Save Changes" : "Create Auction"}
        isSubmitting={isSubmitting}
        submitDisabled={!!slugError || isValidatingSlug}
        cancelDisabled={isSubmitting}
      />
    </form>
  );
}
