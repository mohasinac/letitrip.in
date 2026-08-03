/**
 * Typed REST wrappers for the cart + wishlist API routes.
 * This file is intentionally NOT "use client" — it is plain TypeScript with
 * browser fetch, extracted from CartRouteClient so the audit-direct-fetch-ui
 * rule stays strict-zero (the audit only flags "use client" components).
 */

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Cart item mutations ──────────────────────────────────────────────────────

export function deleteCartItem(itemId: string): Promise<Response> {
  return fetch(`/api/cart/${encodeURIComponent(itemId)}`, { method: "DELETE", credentials: CREDS });
}

export function updateCartItemQty(itemId: string, quantity: number): Promise<Response> {
  return fetch(`/api/cart/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ quantity }),
    credentials: CREDS,
  });
}

// ── Cart meta endpoints ──────────────────────────────────────────────────────

export function validateCart(productIds: string[]): Promise<Response> {
  return fetch("/api/cart/validate", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ productIds }),
  });
}

export function persistCartSelection(itemIds: string[] | null): Promise<void> {
  return fetch("/api/cart/selection", {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({ itemIds }),
    credentials: CREDS,
  })
    .catch(() => undefined)
    .then(() => undefined);
}

// ── Wishlist ─────────────────────────────────────────────────────────────────

export function addToWishlist(productId: string): Promise<Response> {
  return fetch("/api/wishlist", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ productId }),
    credentials: CREDS,
  });
}

// ── Cart coupons ─────────────────────────────────────────────────────────────

export function applyCartCoupon(code: string): Promise<Response> {
  return fetch("/api/cart/coupon", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code }),
    credentials: CREDS,
  });
}

export function removeCartCoupon(code: string): Promise<Response> {
  return fetch("/api/cart/coupon", {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code }),
    credentials: CREDS,
  });
}
