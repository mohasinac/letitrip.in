"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency } from "@/utils";
import { usePlaceBid } from "@/hooks";
import { Button, Input, Label, Span, Text } from "@/components";
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
  const t = useTranslations("auctions");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const [bidAmount, setBidAmount] = useState<string>("");
  const { mutate: placeBidMutation, isLoading: isSubmitting } = usePlaceBid();
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
        t("minimumBidError", { amount: formatCurrency(minimumRequired) }),
      );
      return;
    }

    try {
      const bid = await placeBidMutation({
        productId,
        bidAmount: amount,
      });

      setSuccess(true);
      setBidAmount("");
      onBidPlaced?.(bid);
      // Refresh to show updated bid
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("bidFailed");
      setError(message);
    }
  };

  // Auction ended state
  if (isEnded) {
    return (
      <div
        className={`rounded-xl border ${themed.border} p-4 text-center ${themed.textSecondary} text-sm`}
      >
        {t("auctionEndedInfo")}
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={`rounded-xl border ${themed.border} p-4 text-center`}>
        <Text size="sm" variant="secondary" className="mb-3">
          {t("loginToBid")}
        </Text>
        <Button
          variant="primary"
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
          className="px-6 py-2 text-sm font-semibold"
        >
          {tActions("submit")}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border ${themed.border} p-4 space-y-3`}
    >
      <div>
        <Label
          htmlFor="bid-amount"
          className={`block text-sm font-medium ${themed.textPrimary} mb-1`}
        >
          {t("yourBidLabel")}
        </Label>
        <Text size="xs" variant="secondary" className="mb-2">
          {t("minimumBidError", { amount: formatCurrency(minimumRequired) })}
        </Text>
        <div className="flex items-center gap-2">
          <Span className={`text-sm font-medium ${themed.textSecondary}`}>
            {currency}
          </Span>
          <Input
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
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-10 px-5 text-sm font-semibold whitespace-nowrap"
          >
            {isSubmitting ? tLoading("default") : t("placeBid")}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Text size="sm" variant="error">
          {error}
        </Text>
      )}

      {/* Success */}
      {success && (
        <Text
          size="sm"
          className="text-emerald-600 dark:text-emerald-400 font-medium"
        >
          {t("bidPlaced")}
        </Text>
      )}
    </form>
  );
}
