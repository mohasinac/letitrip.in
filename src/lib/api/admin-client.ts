// NOT "use client" — typed REST wrappers for admin control-plane routes.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.

import { API_ROUTES } from "@/constants/api";
import { API_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";

import type { AdminListResponse, JsonBody } from "./types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const CREDS = "include" as const;

// ── Site settings / integrations ────────────────────────────────────

/**
 * The admin settings document, with `credentials` already stripped and
 * `credentialsMasked` in its place by the route.
 *
 * 🛑 These live here rather than in the component because a raw `fetch()` in a
 * UI file is blocked by `audit-direct-fetch-ui`, and the reason is not style:
 * a wrapper is the one place a URL, the credentials mode and the error shape
 * are stated once. `/lib/api/` is the directory that audit exempts.
 */
export function getAdminSiteSettings(): Promise<Response> {
  return fetch(API_ENDPOINTS.ADMIN.ADMIN_SITE, { credentials: CREDS });
}

/**
 * Patch the settings document. One write, which is what makes the audit log
 * record one action.
 *
 * 🛑 The body is `IntegrationSettingsPatch`-shaped for the integrations page,
 * but typed as `JsonBody` here because this wrapper also serves the broader
 * Site Settings form. The NARROW type lives at the producer
 * (`integrationPatch`), where a misspelled group is a compile error; widening
 * it again at the transport would undo that, so nothing downstream of this
 * call re-derives a group name.
 */
export function putAdminSiteSettings(body: JsonBody): Promise<Response> {
  return fetch(API_ENDPOINTS.ADMIN.ADMIN_SITE, {
    method: "PUT",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(body),
  });
}

// ── Dispute reasons ─────────────────────────────────────────────────────────

/**
 * Retire (`false`) or reactivate (`true`) one reason.
 *
 * 🛑 One boolean, both directions — not an `action: "retire" | "reactivate"`
 * string. The document stores `isActive`, and a second vocabulary for it is a
 * second thing that can disagree with the field. There is deliberately no
 * delete: a past dispute names the row, and the schema's header spells out that
 * deleting would orphan that record and take its author with it.
 */
export function setDisputeReasonActive(id: string, isActive: boolean): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.DISPUTE_REASON_BY_ID(id), {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ isActive }),
  });
}

/**
 * Add a reason.
 *
 * 🛑 POSTs the PUBLIC `/api/dispute-reasons`, not an admin twin. That route is
 * already staff-gated (`ROLES_BACK_OFFICE` + `admin:support-tickets:write`) and
 * already owns the id scheme and the collision rule — a colliding create
 * returns the existing row and reactivates a retired one. A second create
 * endpoint would be a second place for that behaviour to drift, and the
 * management page and the triage drawer would then no longer be adding the same
 * way.
 */
export function createDisputeReason(input: {
  label: string;
  kind: string;
}): Promise<Response> {
  return fetch(API_ROUTES.DISPUTE_REASONS, {
    method: "POST",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify(input),
  });
}

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

// ── Obligations + protection claims ──────────────────────────────────────────
//
// Typed wrappers so the two admin clients stop calling `fetch` directly. Each
// returns the raw `Response` on purpose, matching every wrapper above: the call
// sites pipe it through `readListResponse`, which distinguishes "the request
// failed" from "the list is empty" — a distinction a pre-parsed body loses.

export function getAdminObligations(window: string): Promise<Response> {
  return fetch(
    `${API_ROUTES.ADMIN.MAINTENANCE_OBLIGATIONS}?window=${encodeURIComponent(window)}`,
    { credentials: CREDS },
  );
}

export function getAdminProtectionClaims(): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.PROTECTION_CLAIMS, { credentials: CREDS });
}

export function adjudicateProtectionClaim(
  id: string,
  finding: "genuine" | "change-of-mind",
): Promise<Response> {
  return fetch(API_ROUTES.ADMIN.PROTECTION_CLAIM_BY_ID(id), {
    method: "PATCH",
    headers: JSON_HEADERS,
    credentials: CREDS,
    body: JSON.stringify({ finding }),
  });
}
