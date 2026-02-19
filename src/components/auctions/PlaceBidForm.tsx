"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import { apiClient } from "@/lib/api-client";
import type { BidDocument } from "@/db/schema";

const { themed } = THEME_CONSTANTS;

interface PlaceBidFormProps {
  productId: string;
  minimumBid: number;
  currency?: string;
  isEnded?: boolean;
  isAuthenticated?: boolean;
  onBidPlaced?: (bid: BidDocument) => void;
}

export function PlaceBidForm({
  productId,
  minimumBid,
  currency = "INR",
  isEnded = false,
  isAuthenticated = false,
  onBidPlaced,
}: PlaceBidFormProps) {
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Must bid at least 1 unit above minimum
  const minimumRequired = minimumBid + 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = Number(bidAmount);
    if (!amount || amount < minimumRequired) {
      setError(
        `${UI_LABELS.AUCTIONS_PAGE.MINIMUM_BID(formatCurrency(minimumRequired))}`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const bid = await apiClient.post<BidDocument>(API_ENDPOINTS.BIDS.CREATE, {
        productId,
        bidAmount: amount,
      });

      setSuccess(true);
      setBidAmount("");
      onBidPlaced?.(bid);
      // Refresh to show updated bid
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to place bid";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auction ended state
  if (isEnded) {
    return (
      <div
        className={`rounded-xl border ${themed.border} p-4 text-center ${themed.textSecondary} text-sm`}
      >
        {UI_LABELS.AUCTIONS_PAGE.AUCTION_ENDED_INFO}
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={`rounded-xl border ${themed.border} p-4 text-center`}>
        <p className={`text-sm ${themed.textSecondary} mb-3`}>
          {UI_LABELS.AUCTIONS_PAGE.LOGIN_TO_BID}
        </p>
        <button
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          {UI_LABELS.ACTIONS.SUBMIT}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border ${themed.border} p-4 space-y-3`}
    >
      <div>
        <label
          htmlFor="bid-amount"
          className={`block text-sm font-medium ${themed.textPrimary} mb-1`}
        >
          {UI_LABELS.AUCTIONS_PAGE.YOUR_BID_LABEL}
        </label>
        <p className={`text-xs ${themed.textSecondary} mb-2`}>
          {UI_LABELS.AUCTIONS_PAGE.MINIMUM_BID(formatCurrency(minimumRequired))}
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${themed.textSecondary}`}>
            {currency}
          </span>
          <input
            id="bid-amount"
            type="number"
            min={minimumRequired}
            step={1}
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder={String(minimumRequired)}
            className={`flex-1 h-10 px-3 rounded-lg border text-sm ${themed.border} ${themed.bgPrimary} ${themed.textPrimary} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {isSubmitting
              ? UI_LABELS.LOADING.DEFAULT
              : UI_LABELS.AUCTIONS_PAGE.PLACE_BID}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Success */}
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {UI_LABELS.AUCTIONS_PAGE.BID_PLACED}
        </p>
      )}
    </form>
  );
}
