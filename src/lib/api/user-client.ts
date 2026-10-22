// NOT "use client" — typed REST wrappers for user account routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit/client";
// 🛑 "@/constants/api", never the "@/constants" barrel: that barrel re-exports
// navigation.tsx, which imports @mohasinac/appkit/client and would pull a
// second appkit instance into whatever graph touches it (CLAUDE.md, Known TS
// Patterns).
import { API_ROUTES } from "@/constants/api";

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Bids ─────────────────────────────────────────────────────────────────────

export function getUserBids(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export function getUserCoupons(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function deleteUserCoupon(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE", credentials: CREDS });
}

export function updateUserCoupon(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Digital codes / orders ────────────────────────────────────────────────────

export function getOrderDigitalCode(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function getUserOrders(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

/**
 * Buyer submits payment for one EMI instalment.
 *
 * Wrapped here rather than fetched inline from the order page, which is what
 * `audit-direct-fetch-ui` blocks — and the reason holds: the credentials
 * mode, the method and the URL shape belong in one place rather than being
 * restated at the call site.
 *
 * Distinct from the seller's `PATCH /api/store/orders/[id]/emi-installment`:
 * the buyer REPORTS a payment, the seller CONFIRMS it.
 */
export function submitEmiInstallment(
  orderId: string,
  body: { installmentIndex: number; transactionId: string; proofUrl?: string },
): Promise<Response> {
  return fetch(API_ROUTES.USER.ORDER_EMI_INSTALLMENT(orderId), {
    method: "POST",
    credentials: CREDS,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

// ── Events ────────────────────────────────────────────────────────────────────

export function getUserEvents(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function getUserNotifications(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

/**
 * Set a notification's read state.
 *
 * 🛑 `isRead` is a PARAMETER now. This sent no body at all and the route
 * hard-coded `markAsRead`, so read was a one-way door: a notification opened
 * by accident left the unread list for good.
 */
export function setUserNotificationRead(url: string, isRead: boolean): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    credentials: CREDS,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isRead }),
  });
}

export function markAllUserNotificationsRead(url: string): Promise<Response> {
  return fetch(url, { method: "POST", credentials: CREDS });
}

export function deleteUserNotification(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE", credentials: CREDS });
}

/* ── Sessions and saved payment methods ───────────────────────────────────
 *
 * Both APIs predate their pages by a long way and had no client wrapper at
 * all — which is also why `lir/no-fetch-in-ui` exists: without a wrapper the
 * first consumer reaches for a bare `fetch` in the view.
 */

export function fetchUserSessions(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function revokeUserSession(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE", credentials: CREDS });
}

export function fetchUserPaymentMethods(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function deleteUserPaymentMethod(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE", credentials: CREDS });
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export function requestAddressUnban(id: string, note: string): Promise<Response> {
  return fetch(API_ENDPOINTS.ACCOUNT.ADDRESS_BY_ID(id), {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ banStatus: "unban_requested", unbanRequestNote: note }),
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export function getUserReviews(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function getUserReviewsByRole(role: "buyer" | "seller"): Promise<Response> {
  return fetch(`${API_ENDPOINTS.ACCOUNT.REVIEWS}?reviewerRole=${role}`, { credentials: CREDS });
}

// ── Wishlist validation ────────────────────────────────────────────────────────

export function validateWishlist(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function syncWishlistItem(url: string): Promise<Response> {
  return fetch(url, { method: "POST", credentials: CREDS });
}

// ── Protection claims (buyer side) ───────────────────────────────────────────
//
// Raw `Response` out, matching every wrapper above: the claim form reads
// `body.error` on a 4xx to show the server's own refusal text, which a
// pre-parsed helper would have to re-invent.

export function getOrderClaimOptions(orderId: string): Promise<Response> {
  return fetch(API_ROUTES.USER.ORDER_CLAIM(orderId), { credentials: CREDS });
}

export function fileOrderClaim(
  orderId: string,
  body: { reason: string; detail: string },
): Promise<Response> {
  return fetch(API_ROUTES.USER.ORDER_CLAIM(orderId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Disputes ─────────────────────────────────────────────────────────────────

/**
 * One order, for the dispute form's gate.
 *
 * 🛑 The gate needs four dates (`deliveryDate`, `completedAt`, `shippingDate`,
 * `estimatedDeliveryDate`) and the adapter emits them as ISO **strings** —
 * `DisputeGateOrder`'s own `asDate` helper accepts either, which is why the
 * form can be handed the API shape directly. Mapping them to `Date` here would
 * be a third place that conversion lives.
 */
export function getUserOrder(orderId: string): Promise<Response> {
  return fetch(API_ROUTES.USER.ORDER_BY_ID(orderId), { credentials: CREDS });
}

/**
 * Raise a dispute.
 *
 * The route validates SHAPE only; `raiseOrderDisputeAction` owns every real
 * decision — that the kind is a union member, that the reason exists and
 * belongs to that kind, and that the gate allows it on this order. So a
 * client-side gate here is an affordance, never a guard.
 */
export function raiseOrderDispute(
  orderId: string,
  body: { kind: string; reasonId: string; detail?: string },
): Promise<Response> {
  return fetch(API_ROUTES.ORDERS.DISPUTE(orderId), {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
