// NOT "use client" — typed REST wrappers for store management routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import type { JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Analytics ────────────────────────────────────────────────────────────────

export function getStoreAnalytics(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function getAnalyticsCards(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

/**
 * Create a custom analytics card.
 *
 * Missing until 2026-08-27, which is why the "New custom card" button on
 * /store/analytics/cards had no onClick at all — the route and the schema
 * both existed, and nothing could reach them.
 */
export function createAnalyticsCard(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

export function updateAnalyticsCard(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Store categories ─────────────────────────────────────────────────────────

export function createStoreCategory(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getStoreCategory(url: string): Promise<Response> {
  return fetch(url);
}

export function updateStoreCategory(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteStoreCategory(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export function createStoreCoupon(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getStoreCoupon(url: string): Promise<Response> {
  return fetch(url);
}

export function updateStoreCoupon(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteStoreCoupon(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Grouped listings ─────────────────────────────────────────────────────────

export function createGroupedListing(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getGroupedListing(url: string): Promise<Response> {
  return fetch(url);
}

export function updateGroupedListing(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteGroupedListing(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Listing templates ─────────────────────────────────────────────────────────

export function getListingTemplates(url: string): Promise<Response> {
  return fetch(url);
}

export function createListingTemplate(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getListingTemplate(url: string): Promise<Response> {
  return fetch(url);
}

export function updateListingTemplate(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteListingTemplate(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Payout methods ───────────────────────────────────────────────────────────

export function createPayoutMethod(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getPayoutMethod(url: string): Promise<Response> {
  return fetch(url);
}

export function updatePayoutMethod(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deletePayoutMethod(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Shipping configs ──────────────────────────────────────────────────────────

export function createShippingConfig(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function getShippingConfig(url: string): Promise<Response> {
  return fetch(url);
}

export function updateShippingConfig(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export function deleteShippingConfig(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE" });
}

// ── Slug / storefront ─────────────────────────────────────────────────────────

export function getStorefront(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function checkStoreSlug(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function updateStoreProfile(url: string, body: JsonBody): Promise<Response> {
  return fetch(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Sublisting categories ────────────────────────────────────────────────────

export function getSublistingCategories(url: string): Promise<Response> {
  return fetch(url, { credentials: CREDS });
}

export function deleteSublistingCategory(url: string): Promise<Response> {
  return fetch(url, { method: "DELETE", credentials: CREDS });
}
