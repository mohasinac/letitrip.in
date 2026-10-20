// NOT "use client" — a typed REST wrapper for the points ledger.
// Imported from "use client" components; audit-direct-fetch-ui ignores /lib/api/.
//
// `UserPointsView` called `fetch(API_ROUTES.USER_POINTS)` inline and shaped the
// response at the call site with an inline `as { data?: { … } }`. That is the
// pattern `audit-direct-fetch-ui` blocks, and the reason is drift rather than
// style: an inline cast is a second, local declaration of the endpoint's
// contract, so the view and the handler can disagree with nothing to catch it
// (Root Cause #42 — the same defect that put a hand-written copy of
// `CheckoutPricingPreview` in payment-client.ts and let `emiSurcharge` go
// missing).

import { API_ROUTES } from "@/constants/api";

/**
 * One row of the ledger, as `GET /api/user/points` actually projects it.
 *
 * 🛑 Read off the handler, not guessed. A first draft of this file invented
 * `delta` and `reason`; the route emits `kind` / `amount` / `description`,
 * and `UserPointsView` had its own matching copy. Three names for one shape
 * was the very drift this wrapper exists to remove.
 */
export interface PointsLedgerEntry {
  id: string;
  kind:
    | "shipping_saving"
    | "redemption"
    | "redemption_reversal"
    | "admin_adjustment";
  amount: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface UserPointsResponse {
  data?: {
    balance?: number;
    entries?: PointsLedgerEntry[];
  };
}

/**
 * The caller's own points balance and ledger.
 *
 * 🛑 `same-origin`, not `include`. This is a first-party endpoint and the
 * session cookie is first-party; `include` would additionally attach
 * credentials on a cross-origin redirect, which this request has no reason to
 * do. Returns the raw `Response` so the caller keeps its own `res.ok`
 * handling — the existing wrappers in this directory do the same.
 */
export async function fetchUserPoints(): Promise<Response> {
  return fetch(API_ROUTES.USER_POINTS, { credentials: "same-origin" });
}
