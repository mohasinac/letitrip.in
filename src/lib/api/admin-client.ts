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

// ── Feature flags ────────────────────────────────────────────────────────────

export function setFeatureFlags(flags: Record<string, boolean>): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.FEATURE_FLAGS, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ flags }),
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
