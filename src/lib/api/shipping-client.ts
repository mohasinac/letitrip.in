import { API_ROUTES } from "@/constants";
import type { ShippingQuoteOption } from "@mohasinac/appkit/client";

/**
 * Typed wrapper for `POST /api/shipping/quote`.
 *
 * 🛑 Lives here rather than as a raw `fetch` in the checkout component, which
 * is what `audit-direct-fetch-ui` blocks and for a reason worth keeping: a
 * fetch inlined in a view has its response shape asserted at the call site,
 * so the `data.options` cast drifts from the route the moment either side
 * changes and nothing catches it. One wrapper, one shape, one place to update.
 */
export interface ShippingQuoteResult {
  isServiceable: boolean;
  options: ShippingQuoteOption[];
}

export async function fetchShippingQuote(
  pincode: string,
  signal?: AbortSignal,
): Promise<ShippingQuoteResult> {
  const res = await fetch(API_ROUTES.SHIPPING_QUOTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ pincode }),
    signal,
  });

  /*
   * A non-2xx is "no rates", not an exception. The caller's whole contract is
   * that a failed quote falls back to the seller's own shipping — turning a
   * 500 into a throw there would just be caught and flattened into the same
   * state, with an extra stack trace in the console for a path that is
   * explicitly allowed to fail.
   */
  if (!res.ok) return { isServiceable: false, options: [] };

  const json = (await res.json().catch(() => null)) as {
    data?: Partial<ShippingQuoteResult>;
  } | null;

  return {
    isServiceable: json?.data?.isServiceable === true,
    options: Array.isArray(json?.data?.options) ? json.data.options : [],
  };
}
