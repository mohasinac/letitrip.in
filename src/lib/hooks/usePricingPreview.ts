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

/**
 * Why a status and not just `preview == null`.
 *
 * `null` used to mean four different things at once — not started, in flight,
 * a lane with nothing payable, and a request that failed — and callers picked
 * whichever reading suited them. The visible consequence was a hard ₹0.00
 * Total: the server returns a fully-zeroed preview object for an empty lane
 * (`EMPTY_PRICING_PREVIEW`), which is truthy, so `preview ? preview.total :
 * fallback` rendered the zero. Meanwhile a genuine failure was swallowed
 * entirely and the whole add-ons section simply disappeared.
 *
 *   not started / in flight  → "idle" | "loading"   (and preview is null)
 *   lane has nothing payable → "ready", preview.stores.length === 0
 *   real figures             → "ready", preview.stores.length > 0
 *   request failed           → "error", preview is the LAST GOOD one, or null
 */
export type PricingPreviewStatus = "idle" | "loading" | "ready" | "error";

export interface UsePricingPreviewResult {
  preview: CheckoutPricingPreview | null;
  isLoadingPreview: boolean;
  status: PricingPreviewStatus;
  /** Human-readable failure reason, or null. Only set while `status` is "error". */
  error: string | null;
}

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
}): UsePricingPreviewResult {
  const [preview, setPreview] = useState<CheckoutPricingPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [status, setStatus] = useState<PricingPreviewStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setPreview(null);
      setStatus("idle");
      setError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsLoadingPreview(true);
      setStatus("loading");
      fetchCheckoutPricingPreview({ addressId, paymentMethod, lane })
        .then(async (res) => {
          if (cancelled) return;
          const json = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (!res.ok || !json?.data) {
            // Deliberately does NOT clear `preview`. On a refetch failure the
            // last good figures plus a warning beat blanking the summary to
            // zero, which is what the previous bare `return` produced.
            setError(typeof json?.error === "string" ? json.error : "Couldn't calculate fees.");
            setStatus("error");
            return;
          }
          setPreview(json.data as CheckoutPricingPreview);
          setError(null);
          setStatus("ready");
        })
        .catch((err: unknown) => {
          const normalized = normalizeError(err);
          if (cancelled) return;
          setError(normalized.message);
          setStatus("error");
        })
        .finally(() => {
          if (!cancelled) setIsLoadingPreview(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, addressId, paymentMethod, lane, addonSignal, couponSignal]);

  return { preview, isLoadingPreview, status, error };
}
