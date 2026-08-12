// NOT "use client" — typed REST wrappers for user account routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ENDPOINTS } from "@mohasinac/appkit";

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
