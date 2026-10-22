/**
 * Typed REST wrappers for the cart + wishlist API routes.
 * This file is intentionally NOT "use client" — it is plain TypeScript with
 * browser fetch, extracted from CartRouteClient so the audit-direct-fetch-ui
 * rule stays strict-zero (the audit only flags "use client" components).
 */

import { API_ENDPOINTS } from "@mohasinac/appkit/client";
import { reportClientError, normalizeError } from "@mohasinac/appkit/client";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Cart item mutations ──────────────────────────────────────────────────────

export function deleteCartItem(itemId: string): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.BY_ITEM_ID(itemId), { method: "DELETE", credentials: CREDS });
}

/**
 * Empty the cart in one request.
 *
 * The route has existed since the cart was built and had no caller: "Remove all"
 * looped `deleteCartItem` per row instead. That loop could not express what the
 * server already knows — a locked line survives, an unknown id 404s — so it
 * reported success unconditionally over a cart that had not been cleared.
 *
 * Returns the raw Response so the caller can read the server's own failure code
 * rather than guessing at one.
 */
export function clearCart(): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.GET, { method: "DELETE", credentials: CREDS });
}

export function updateCartItemQty(itemId: string, quantity: number): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.BY_ITEM_ID(itemId), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ quantity }),
    credentials: CREDS,
  });
}

/**
 * Replace a grouped line's member quantities. Sends the WHOLE array, not a
 * delta — the cart is one Firestore document, so a per-member request would
 * race with itself on a fast double-click. A member at 0 is dropped; dropping
 * the last one removes the line server-side.
 */
export function updateCartGroupMembers(
  itemId: string,
  groupMembers: Array<{ productId: string; quantity: number }>,
): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.BY_ITEM_ID(itemId), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ groupMembers }),
    credentials: CREDS,
  });
}

// ── Cart meta endpoints ──────────────────────────────────────────────────────

export function validateCart(productIds: string[]): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.VALIDATE, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ productIds }),
  });
}

/**
 * Persist which cart items are ticked. Deliberately fire-and-forget — the
 * checkbox has already moved and the cart works without this — but no longer
 * SILENT.
 *
 * `safeRead` is the server-side equivalent and cannot be used here: it pulls in
 * the server reporter, and this module is in the client graph. The beacon is
 * the client's half of the same idea, and it dedupes, so a flapping network
 * does not turn one broken tick into a thousand rows.
 */
export function persistCartSelection(itemIds: string[] | null): Promise<void> {
  return fetch(API_ENDPOINTS.CART.SELECTION, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ itemIds }),
    credentials: CREDS,
  })
    .then((res) => {
      if (!res.ok) {
        reportClientError({
          code: "CART_SELECTION_PERSIST_FAILED",
          message: `PUT ${API_ENDPOINTS.CART.SELECTION} responded ${res.status}`,
        });
      }
    })
    .catch((err: unknown) => {
      reportClientError({
        code: "CART_SELECTION_PERSIST_FAILED",
        message: normalizeError(err).message,
      });
    });
}

/** Paid add-on selections for ONE store — mirrors CartStoreAddons. */
export interface CartStoreAddonSelections {
  giftWrapAddon?: boolean;
  giftWrapMessage?: string;
  shipmentProtectionAddon?: boolean;
  saleProtectionAddon?: boolean;
}

/**
 * Persist one store's add-on selections to the cart document.
 *
 * Add-ons are billed per store, so they are chosen and stored per store. This
 * write is what the checkout server actions later read — the checkout request
 * itself carries no add-on flags.
 *
 * Unlike `persistCartSelection` this does NOT swallow failures: a dropped
 * add-on write means the buyer is charged something other than what they see,
 * so the caller needs to know and re-sync.
 */
export async function persistCartAddons(
  storeId: string,
  addons: CartStoreAddonSelections,
): Promise<void> {
  const res = await fetch(API_ENDPOINTS.CART.ADDONS, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ storeId, ...addons }),
    credentials: CREDS,
  });
  if (!res.ok) throw new Error("Failed to update add-ons");
}

/**
 * Turn "pay with my points" on or off for this cart (D46/D47).
 *
 * 🛑 Sends a BOOLEAN. The amount is derived server-side from the live balance
 * and the 50% cap — a client-supplied figure would be a client-supplied
 * discount, which is why the deleted `pointsToRedeem` field was a hazard
 * rather than a feature.
 *
 * Does NOT swallow failures, for the same reason `persistCartAddons` above
 * does not: a dropped write means the buyer is charged something other than
 * what the summary shows, so the caller has to know and re-sync.
 *
 * Returns the live balance so the control can label itself from this one
 * response instead of firing a second request.
 */
export async function persistCartUseAllPoints(
  useAllPoints: boolean,
): Promise<{ useAllPoints: boolean; balance: number }> {
  const res = await fetch(API_ENDPOINTS.CART.POINTS, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ useAllPoints }),
    credentials: CREDS,
  });
  if (!res.ok) throw new Error("Failed to update points");
  const json = (await res.json()) as { data?: { useAllPoints?: boolean; balance?: number } };
  return {
    useAllPoints: json.data?.useAllPoints === true,
    balance: typeof json.data?.balance === "number" ? json.data.balance : 0,
  };
}

/**
 * Persist the cart's instalment plan. `null` opts out.
 *
 * 🛑 Sends a TENURE, never an amount. The token, the surcharge and the
 * schedule are all derived server-side from `siteSettings.emi` — a money
 * figure in this body would be a client-supplied discount, the same hazard
 * `persistCartUseAllPoints` above exists to avoid.
 *
 * 🛑 It writes to the CART rather than travelling in the checkout body,
 * because the online path reads the plan twice in two separate requests. See
 * `CartDocument.emiPlan`.
 *
 * Does NOT swallow failures: a dropped write means the buyer is charged
 * something other than what the summary shows.
 */
export async function persistCartEmiPlan(
  tenureMonths: number | null,
): Promise<{ tenureMonths: number | null; rejected: boolean }> {
  const res = await fetch(API_ENDPOINTS.CART.EMI, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ tenureMonths }),
    credentials: CREDS,
  });
  if (!res.ok) throw new Error("Failed to update the instalment plan");
  const json = (await res.json()) as {
    data?: { tenureMonths?: number | null; rejected?: boolean };
  };
  return {
    tenureMonths: typeof json.data?.tenureMonths === "number" ? json.data.tenureMonths : null,
    rejected: json.data?.rejected === true,
  };
}

// ── Wishlist ─────────────────────────────────────────────────────────────────

export function addToWishlist(productId: string): Promise<Response> {
  return fetch(API_ENDPOINTS.WISHLIST.ADD, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ productId }),
    credentials: CREDS,
  });
}

// ── Cart coupons ─────────────────────────────────────────────────────────────

export function applyCartCoupon(code: string): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.COUPON, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code }),
    credentials: CREDS,
  });
}

export function removeCartCoupon(code: string): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.COUPON, {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code }),
    credentials: CREDS,
  });
}
