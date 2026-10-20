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

export function markUserNotificationRead(url: string): Promise<Response> {
  return fetch(url, { method: "PATCH", credentials: CREDS });
}

export function markAllUserNotificationsRead(url: string): Promise<Response> {
  return fetch(url, { method: "POST", credentials: CREDS });
}

export function deleteUserNotification(url: string): Promise<Response> {
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
