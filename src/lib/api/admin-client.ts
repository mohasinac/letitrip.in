// NOT "use client" — typed REST wrappers for admin control-plane routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ROUTES } from "@/constants/api";

import type { AdminListResponse, JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Checkout bypass ──────────────────────────────────────────────────────────

export function getCheckoutBypassStatus(): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.CHECKOUT_BYPASS, { credentials: CREDS });
}

export function applyCheckoutBypass(body: { addressId: string }): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.CHECKOUT_BYPASS, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

/**
 * Turn the checkout bypass on or off.
 *
 * Goes through the bypass route itself, which is the sole writer that
 * audit-checkout-bypass rule 1 requires. This used to be `setFeatureFlags`
 * hitting the generic /api/admin/feature-flags route — both that helper and
 * that route were deleted 2026-08-29 with the flag group.
 */
export function setCheckoutBypassEnabled(
  enabled: boolean,
  reason?: string,
): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.CHECKOUT_BYPASS, {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ enabled, reason }),
  });
}

// ── Dashboard stats (generic admin list with query params) ───────────────────

export async function fetchAdminResource<T = AdminListResponse>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: CREDS });
  if (!r.ok) throw new Error(`Admin resource ${url} returned HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

// ── Admin notifications ──────────────────────────────────────────────────────

export function getAdminNotifications(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function markAdminNotificationRead(url: string, id: string): Promise<Response> {
  return fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ isRead: true, readAt: new Date() }),
  });
}

// ── Item requests ────────────────────────────────────────────────────────────

export function getAdminItemRequests(url: string): Promise<Response> {
  return fetch(url);
}

export function updateAdminItemRequest(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

// ── Moderation ───────────────────────────────────────────────────────────────

export function getAdminModerationQueue(url: string): Promise<Response> {
  return fetch(url);
}

export function updateAdminModeration(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

// ── Reports ──────────────────────────────────────────────────────────────────

export function getAdminReports(url: string): Promise<Response> {
  return fetch(url);
}

export function updateAdminReport(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

// ── Roles ────────────────────────────────────────────────────────────────────

export function getAdminRoles(url: string): Promise<Response> {
  return fetch(url);
}

export function createAdminRole(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getAdminRole(url: string): Promise<Response> {
  return fetch(url);
}

export function updateAdminRole(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteAdminRole(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Users ────────────────────────────────────────────────────────────────────

export function getAdminUser(url: string): Promise<Response> {
  return fetch(url);
}

export function getAdminUserAddresses(userId: string): Promise<Response> {
  return fetch(`${API_ROUTES.ADMIN.ADDRESSES}?ownerType=user&ownerId=${encodeURIComponent(userId)}`);
}

/**
 * Write a lottery's slot configuration.
 *
 * The ONLY sanctioned writer of `lotteryConfig` — the generic event PATCH
 * rejects that field, because it is `.passthrough()` and letting a slot array
 * through it erased every slot a buyer had already pulled.
 */
export function updateLotteryConfig(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}
