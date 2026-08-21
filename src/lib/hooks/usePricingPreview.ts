"use client";

import { useEffect, useState } from "react";
import { normalizeError } from "@mohasinac/appkit/client";
import { fetchCheckoutPricingPreview, type CheckoutPricingPreview } from "@/lib/api/payment-client";

/**
 * Shared debounced fetcher for `/api/checkout/pricing-preview`.
 *
 * Used by both the cart and the checkout page so the two can never show
 * different numbers for the same cart. Debounced at 300ms so toggling an add-on
 * checkbox doesn't fire a request per click.
 *
 * Add-on selections are NOT parameters here — they live on the cart document
 * per store, and the server reads them from there. The dependency list instead
 * carries `addonSignal`, a caller-supplied string that changes whenever a
 * selection is persisted, so the preview refetches without this hook needing to
 * know the shape of what changed.
 */
export function usePricingPreview({
  enabled,
  addressId,
  paymentMethod,
  lane,
  addonSignal = "",
  couponSignal = "",
}: {
  /** False for signed-out carts and for steps that shouldn't fetch yet. */
  enabled: boolean;
  addressId?: string;
  paymentMethod: "cod" | "online" | "upi_manual" | "cash" | "emi";
  /** Which cart lane to price. Omit to let the server price the payable lane. */
  lane?: "standard" | "auction" | "offer";
  /** Changes whenever a per-store add-on selection is persisted. */
  addonSignal?: string;
  /** Serialized applied-coupon state, so applying/removing a coupon refetches. */
  couponSignal?: string;
}) {
  const [preview, setPreview] = useState<CheckoutPricingPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoadingPreview(true);
      fetchCheckoutPricingPreview({ addressId, paymentMethod, lane })
        .then(async (res) => {
          if (!res.ok || cancelled) return;
          const json = await res.json().catch(() => ({}));
          if (!cancelled && json?.data) setPreview(json.data as CheckoutPricingPreview);
        })
        .catch((err: unknown) => void normalizeError(err))
        .finally(() => {
          if (!cancelled) setIsLoadingPreview(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, addressId, paymentMethod, lane, addonSignal, couponSignal]);

  return { preview, isLoadingPreview };
}
