"use client";

import { ChevronDown, ChevronUp, Info } from "lucide-react";
import DateTimePicker from "@/components/common/DateTimePicker";
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
      (1000 * 60 * 60 * 24)
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
            <div>
              <label
                htmlFor="auction-description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="auction-description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Provide detailed description including condition, history, specifications..."
              />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Bid Increment */}
              <div>
                <label
                  htmlFor="auction-bid-increment"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Bid Increment (₹)
                </label>
                <input
                  id="auction-bid-increment"
                  type="number"
                  value={formData.bidIncrement}
                  onChange={(e) => handleChange("bidIncrement", e.target.value)}
                  min="1"
                  step="1"
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="100"
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Minimum amount to increase each bid
                </p>
              </div>

              {/* Reserve Price (for reserve auctions) */}
              {formData.auctionType === "reserve" && (
                <div>
                  <label
                    htmlFor="auction-reserve-price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="5000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Minimum price for item to be sold (hidden from buyers)
                  </p>
                </div>
              )}

              {/* Buy Now Price (for buyNow auctions) */}
              {formData.auctionType === "buyNow" && (
                <div>
                  <label
                    htmlFor="auction-buy-now-price"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="10000"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    Price to end auction and purchase immediately
                  </p>
                </div>
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
                <label
                  htmlFor="auction-start-time"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Start Time
                </label>
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
                <label
                  htmlFor="auction-end-time"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  End Time
                </label>
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
            <div>
              <label
                htmlFor="auction-auto-extend"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Auto-Extend Minutes
              </label>
              <select
                id="auction-auto-extend"
                value={formData.autoExtendMinutes}
                onChange={(e) =>
                  handleChange("autoExtendMinutes", e.target.value)
                }
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="0">No auto-extend</option>
                <option value="2">2 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
              </select>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                Extend auction if bid placed in final minutes
              </p>
            </div>

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
            <div>
              <label
                htmlFor="auction-shipping-terms"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Shipping Terms
              </label>
              <textarea
                id="auction-shipping-terms"
                value={formData.shippingTerms}
                onChange={(e) => handleChange("shippingTerms", e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Describe shipping options, costs, and delivery timeframes..."
              />
            </div>

            {/* Return Policy */}
            <div>
              <label
                htmlFor="auction-return-policy"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Return Policy
              </label>
              <select
                id="auction-return-policy"
                value={formData.returnPolicy}
                onChange={(e) => handleChange("returnPolicy", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Publish Status
              </label>
              <select
                id="auction-status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  Feature this auction
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  Show this auction on the homepage and in featured sections
                </p>
              </label>
            </div>
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
              {formData.startingBid
                ? `₹${parseFloat(formData.startingBid).toLocaleString()}`
                : "—"}
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
