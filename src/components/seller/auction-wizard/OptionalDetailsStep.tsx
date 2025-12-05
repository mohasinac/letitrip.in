"use client";

import { ChevronDown, ChevronUp, Info } from "lucide-react";
import DateTimePicker from "@/components/common/DateTimePicker";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormLabel } from "@/components/forms/FormLabel";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { Price } from "@/components/common/values/Price";
import type { OptionalStepProps } from "./types";

export function OptionalDetailsStep({
  formData,
  setFormData,
  expandedSections,
  toggleSection,
}: OptionalStepProps) {
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate auction duration
  const duration = Math.ceil(
    (formData.endTime.getTime() - formData.startTime.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Additional Details (Optional)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Expand sections below to customize your auction settings
        </p>
      </div>

      {/* Bidding Options Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("bidding")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Bidding Options
          </span>
          {expandedSections.bidding ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.bidding && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Description */}
            <FormTextarea
              id="auction-description"
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              placeholder="Provide detailed description including condition, history, specifications..."
              showCharCount
              maxLength={1000}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Bid Increment */}
              <FormInput
                id="auction-bid-increment"
                label="Bid Increment (₹)"
                type="number"
                value={formData.bidIncrement}
                onChange={(e) => handleChange("bidIncrement", e.target.value)}
                min={1}
                step={1}
                placeholder="100"
                helperText="Minimum amount to increase each bid"
              />

              {/* Reserve Price (for reserve auctions) */}
              {formData.auctionType === "reserve" && (
                <FormInput
                  id="auction-reserve-price"
                  label="Reserve Price (₹)"
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => handleChange("reservePrice", e.target.value)}
                  min={0}
                  step={1}
                  placeholder="5000"
                  helperText="Minimum price for item to be sold (hidden from buyers)"
                />
              )}

              {/* Buy Now Price (for buyNow auctions) */}
              {formData.auctionType === "buyNow" && (
                <FormInput
                  id="auction-buy-now-price"
                  label="Buy Now Price (₹)"
                  type="number"
                  value={formData.buyNowPrice}
                  onChange={(e) => handleChange("buyNowPrice", e.target.value)}
                  min={0}
                  step={1}
                  placeholder="10000"
                  helperText="Price to end auction and purchase immediately"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("schedule")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Auction Schedule
          </span>
          {expandedSections.schedule ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.schedule && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Start Time */}
              <div>
                <FormLabel>Start Time</FormLabel>
                <DateTimePicker
                  id="auction-start-time"
                  value={formData.startTime}
                  onChange={(date) => handleChange("startTime", date)}
                  minDate={new Date()}
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  When bidding will begin
                </p>
              </div>

              {/* End Time */}
              <div>
                <FormLabel>End Time</FormLabel>
                <DateTimePicker
                  id="auction-end-time"
                  value={formData.endTime}
                  onChange={(date) => handleChange("endTime", date)}
                  minDate={formData.startTime}
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  When bidding will close
                </p>
              </div>
            </div>

            {/* Auto Extend */}
            <FormSelect
              id="auction-auto-extend"
              label="Auto-Extend Minutes"
              value={formData.autoExtendMinutes}
              onChange={(e) =>
                handleChange("autoExtendMinutes", e.target.value)
              }
              options={[
                { value: "0", label: "No auto-extend" },
                { value: "2", label: "2 minutes" },
                { value: "5", label: "5 minutes" },
                { value: "10", label: "10 minutes" },
              ]}
              helperText="Extend auction if bid placed in final minutes"
            />

            {/* Duration Info */}
            {duration > 0 && (
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Auction duration: {duration} day{duration !== 1 ? "s" : ""}
                  {duration > 7 && " (Long auction - may reduce urgency)"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shipping & Terms Section */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          type="button"
          onClick={() => toggleSection("shipping")}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium text-gray-900 dark:text-white">
            Shipping & Publishing
          </span>
          {expandedSections.shipping ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.shipping && (
          <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-700">
            {/* Shipping Terms */}
            <FormTextarea
              id="auction-shipping-terms"
              label="Shipping Terms"
              value={formData.shippingTerms}
              onChange={(e) => handleChange("shippingTerms", e.target.value)}
              rows={3}
              placeholder="Describe shipping options, costs, and delivery timeframes..."
            />

            {/* Return Policy */}
            <FormSelect
              id="auction-return-policy"
              label="Return Policy"
              value={formData.returnPolicy}
              onChange={(e) => handleChange("returnPolicy", e.target.value)}
              options={[
                { value: "no-returns", label: "No Returns" },
                { value: "7-days", label: "7 Days Return" },
                { value: "14-days", label: "14 Days Return" },
                { value: "30-days", label: "30 Days Return" },
              ]}
            />

            {/* Status */}
            <FormSelect
              id="auction-status"
              label="Publish Status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { value: "draft", label: "Draft (not visible)" },
                {
                  value: "scheduled",
                  label: "Scheduled (will go live at start time)",
                },
                { value: "live", label: "Publish Immediately" },
              ]}
            />

            {/* Featured */}
            <FormCheckbox
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleChange("featured", e.target.checked)}
              label={
                <>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Feature this auction
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    Show this auction on the homepage and in featured sections
                  </p>
                </>
              }
            />
          </div>
        )}
      </div>

      {/* Auction Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Auction Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Title:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.title || "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              Starting Bid:
            </span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.startingBid ? (
                <Price amount={parseFloat(formData.startingBid)} />
              ) : (
                "—"
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Duration:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {duration} day{duration !== 1 ? "s" : ""}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Images:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium">
              {formData.images.length} uploaded
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium capitalize">
              {formData.status}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Type:</span>{" "}
            <span className="ml-2 text-gray-900 dark:text-white font-medium capitalize">
              {formData.auctionType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
